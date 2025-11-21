const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const CONTENT_DIR = path.join(__dirname, 'content');

// Load S3 configuration
let s3Client = null;
let s3Config = null;

async function loadS3Config() {
  try {
    const configPath = path.join(__dirname, 's3-config.json');
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
