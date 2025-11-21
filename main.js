const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { execSync } = require('child_process');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Determine correct path for content directory (inside or outside asar)
const CONTENT_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'content')
  : path.join(__dirname, 'content');

// Load S3 configuration
let s3Client = null;
let s3Config = null;

async function loadS3Config() {
  try {
    const configPath = app.isPackaged
      ? path.join(process.resourcesPath, 's3-config.json')
      : path.join(__dirname, 's3-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    s3Config = JSON.parse(configData);

    if (s3Config.accessKeyId && s3Config.secretAccessKey) {
      s3Client = new S3Client({
        region: s3Config.region,
        credentials: {
          accessKeyId: s3Config.accessKeyId,
          secretAccessKey: s3Config.secretAccessKey
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to load S3 config:', error.message);
    return false;
  }
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  await loadS3Config();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Get list of all JSON files
ipcMain.handle('get-json-files', async () => {
  try {
    const files = await findJsonFiles(CONTENT_DIR);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Read a specific JSON file
ipcMain.handle('read-json-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(content);
    return { success: true, data: jsonData, rawContent: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write to a JSON file
ipcMain.handle('write-json-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Find S3 URLs in content
ipcMain.handle('find-s3-urls', async () => {
  try {
    const files = await findJsonFiles(CONTENT_DIR);
    const urlMap = [];

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const urls = extractS3Urls(content);
      if (urls.length > 0) {
        urlMap.push({ file, urls });
      }
    }

    return { success: true, urlMap };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper: Recursively find all JSON files
async function findJsonFiles(dir) {
  let results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(await findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }

  return results;
}

// Helper: Extract S3 URLs from JSON content
function extractS3Urls(content) {
  const s3Regex = /https?:\/\/[a-zA-Z0-9\-]+\.s3[a-zA-Z0-9\-\.]*\.amazonaws\.com\/[^\s"'}]+/g;
  return content.match(s3Regex) || [];
}

// File Management Handlers

// Create new JSON file
ipcMain.handle('create-json-file', async (event, category, fileName, initialData) => {
  try {
    let filePath;
    let folderPath;

    // Determine file path based on category
    if (category === 'home') {
      filePath = path.join(CONTENT_DIR, 'home', fileName);
    } else if (category === 'photography') {
      // Photography files go in subdirectories
      const folderName = fileName.replace('.json', '');
      folderPath = path.join(CONTENT_DIR, 'photography', folderName);
      filePath = path.join(folderPath, fileName);
    } else if (category === 'storyboard') {
      // Storyboard files go in subdirectories
      const folderName = fileName.replace('.json', '');
      folderPath = path.join(CONTENT_DIR, 'storyboard', folderName);
      filePath = path.join(folderPath, fileName);
    } else {
      return { success: false, error: 'Invalid category' };
    }

    // Check if file already exists
    try {
      await fs.access(filePath);
      return { success: false, error: 'File already exists' };
    } catch {
      // File doesn't exist, continue
    }

    // Create folder if needed
    if (folderPath) {
      await fs.mkdir(folderPath, { recursive: true });
    }

    // Write initial data
    const content = JSON.stringify(initialData, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');

    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete JSON file
ipcMain.handle('delete-json-file', async (event, filePath) => {
  try {
    // Check if file exists
    await fs.access(filePath);

    // Delete the file
    await fs.unlink(filePath);

    // If it's in a subdirectory (photography or storyboard), try to delete the directory if empty
    const dirPath = path.dirname(filePath);
    const dirName = path.basename(dirPath);

    if (dirName.startsWith('photography-') || dirName.startsWith('storyboard-')) {
      try {
        const files = await fs.readdir(dirPath);
        if (files.length === 0) {
          await fs.rmdir(dirPath);
        }
      } catch {
        // Directory not empty or other error, ignore
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get next available number for a category
ipcMain.handle('get-next-number', async (event, category) => {
  try {
    const categoryPath = path.join(CONTENT_DIR, category);
    const entries = await fs.readdir(categoryPath, { withFileTypes: true });

    let maxNum = 0;

    if (category === 'home') {
      // Look for home*.json files
      entries.forEach(entry => {
        if (entry.isFile() && entry.name.match(/^home(\d+)\.json$/)) {
          const num = parseInt(entry.name.match(/\d+/)[0]);
          if (num > maxNum) maxNum = num;
        }
      });
    } else {
      // Look for photography-* or storyboard-* directories
      entries.forEach(entry => {
        if (entry.isDirectory() && entry.name.match(new RegExp(`^${category}-(\\d+)$`))) {
          const num = parseInt(entry.name.match(/\d+/)[0]);
          if (num > maxNum) maxNum = num;
        }
      });
    }

    return { success: true, nextNumber: maxNum + 1 };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// S3 Upload Handlers

// Check if S3 is configured
ipcMain.handle('s3-is-configured', async () => {
  return { success: true, configured: s3Client !== null };
});

// Select image file
ipcMain.handle('select-image-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'] }
      ]
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    return { success: true, filePath: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Upload file to S3
ipcMain.handle('upload-to-s3', async (event, filePath, s3Key) => {
  try {
    if (!s3Client) {
      return { success: false, error: 'S3 not configured. Please add credentials to s3-config.json' };
    }

    // Read file
    const fileContent = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    // Determine content type
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: s3Config.bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read'
      }
    });

    // Track progress
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      mainWindow.webContents.send('upload-progress', { percentage, loaded: progress.loaded, total: progress.total });
    });

    await upload.done();

    // Generate S3 URL
    const s3Url = `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${s3Key}`;

    return { success: true, url: s3Url };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Delete file from S3
ipcMain.handle('delete-from-s3', async (event, s3Url) => {
  try {
    if (!s3Client) {
      return { success: false, error: 'S3 not configured. Please add credentials to s3-config.json' };
    }

    // Extract S3 key from URL
    // URL format: https://bucket.s3.region.amazonaws.com/key/path/file.jpg
    const urlPattern = new RegExp(`https://${s3Config.bucket}\\.s3[^/]*\\.amazonaws\\.com/(.+)`);
    const match = s3Url.match(urlPattern);

    if (!match) {
      return { success: false, error: 'Invalid S3 URL format' };
    }

    const s3Key = decodeURIComponent(match[1]);

    // Delete from S3
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key
    });

    await s3Client.send(command);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Publish Handlers

const MAIN_PROJECT_PATH = '/Users/ro.raju/private/aitormaguregidigitalvisualartist';
const MAIN_PROJECT_CONTENT = path.join(MAIN_PROJECT_PATH, 'content');
const OUTPUT_WEBSITE_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'dist', 'website')
  : path.join(__dirname, 'dist', 'website');

// Helper: Compare two JSON files
async function compareJsonFiles(file1, file2) {
  try {
    const content1 = await fs.readFile(file1, 'utf8');
    const content2 = await fs.readFile(file2, 'utf8');
    return content1 !== content2;
  } catch (error) {
    // If one file doesn't exist, they're different
    return true;
  }
}

// Helper: Recursively compare directories
async function compareDirectories(dir1, dir2) {
  const changes = [];

  try {
    // Get all files from source directory
    const files1 = await getAllFiles(dir1);
    const files2 = await getAllFiles(dir2);

    // Check for new or modified files
    for (const file of files1) {
      const relativePath = path.relative(dir1, file);
      const file2Path = path.join(dir2, relativePath);

      if (!files2.find(f => path.relative(dir2, f) === relativePath)) {
        changes.push({ type: 'new', path: relativePath });
      } else if (await compareJsonFiles(file, file2Path)) {
        changes.push({ type: 'modified', path: relativePath });
      }
    }

    // Check for deleted files
    for (const file of files2) {
      const relativePath = path.relative(dir2, file);
      if (!files1.find(f => path.relative(dir1, f) === relativePath)) {
        changes.push({ type: 'deleted', path: relativePath });
      }
    }

    return changes;
  } catch (error) {
    console.error('Error comparing directories:', error);
    return [];
  }
}

// Helper: Get all files recursively
async function getAllFiles(dir) {
  const files = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }

  return files;
}

// Helper: Copy directory recursively
async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Check for changes between handler and main project
ipcMain.handle('check-content-changes', async () => {
  try {
    const changes = await compareDirectories(CONTENT_DIR, MAIN_PROJECT_CONTENT);
    return { success: true, hasChanges: changes.length > 0, changes };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Publish: Copy content and rebuild website
ipcMain.handle('publish-website', async (event) => {
  try {
    // Step 1: Copy content from handler to main project
    mainWindow.webContents.send('publish-progress', { step: 'copying', message: 'Copying content files...' });

    // Remove old content
    await fs.rm(MAIN_PROJECT_CONTENT, { recursive: true, force: true });
    // Copy new content
    await copyDirectory(CONTENT_DIR, MAIN_PROJECT_CONTENT);

    // Step 2: Run build script in main project
    mainWindow.webContents.send('publish-progress', { step: 'building', message: 'Building website...' });

    try {
      execSync('node build.js', {
        cwd: MAIN_PROJECT_PATH,
        stdio: 'pipe',
        encoding: 'utf8'
      });
    } catch (buildError) {
      return { success: false, error: `Build failed: ${buildError.message}` };
    }

    // Step 3: Copy built website to handler's dist/website
    mainWindow.webContents.send('publish-progress', { step: 'finalizing', message: 'Copying website files...' });

    const mainProjectDist = path.join(MAIN_PROJECT_PATH, 'dist');
    await fs.rm(OUTPUT_WEBSITE_DIR, { recursive: true, force: true });
    await copyDirectory(mainProjectDist, OUTPUT_WEBSITE_DIR);

    mainWindow.webContents.send('publish-progress', { step: 'complete', message: 'Publish complete!' });

    return {
      success: true,
      outputPath: OUTPUT_WEBSITE_DIR,
      mainProjectDist: mainProjectDist
    };
  } catch (error) {
    mainWindow.webContents.send('publish-progress', { step: 'error', message: error.message });
    return { success: false, error: error.message };
  }
});
