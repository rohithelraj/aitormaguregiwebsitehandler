let currentFilePath = null;
let allJsonFiles = [];
let currentJsonData = null;
let isFormView = true;

// Deletion history for undo functionality
let deletionHistory = [];
let currentToastTimeout = null;

// DOM Elements
const fileList = document.getElementById('fileList');
const emptyState = document.getElementById('emptyState');
const editorContainer = document.getElementById('editorContainer');
const currentFileName = document.getElementById('currentFileName');
const jsonEditor = document.getElementById('jsonEditor');
const formEditor = document.getElementById('formEditor');
const refreshBtn = document.getElementById('refreshBtn');
const saveBtn = document.getElementById('saveBtn');
const toggleViewBtn = document.getElementById('toggleViewBtn');
const findUrlsBtn = document.getElementById('findUrlsBtn');
const publishBtn = document.getElementById('publishBtn');
const deployBtn = document.getElementById('deployBtn');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const allUrlsContent = document.getElementById('allUrlsContent');
const publishModal = document.getElementById('publishModal');
const closePublishModal = document.querySelector('.close-publish');
const publishLog = document.getElementById('publishLog');
const toast = document.getElementById('toast');

// Initialize
loadJsonFiles();

// Event Listeners
refreshBtn.addEventListener('click', loadJsonFiles);
saveBtn.addEventListener('click', saveCurrentFile);
toggleViewBtn.addEventListener('click', toggleView);
findUrlsBtn.addEventListener('click', showAllS3Urls);
publishBtn.addEventListener('click', handlePublish);
deployBtn.addEventListener('click', handleDeploy);
closeModal.addEventListener('click', () => modal.style.display = 'none');
closePublishModal.addEventListener('click', () => publishModal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === publishModal) publishModal.style.display = 'none';
});

// Listen for publish progress updates
window.electronAPI.onPublishProgress((data) => {
  if (data.step === 'complete') {
    addPublishLogEntry('✓ Publish Complete', 'success', 'Website has been built and is ready in dist/website');
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish';
    // Enable deploy button after successful build
    deployBtn.disabled = false;
  } else if (data.step === 'error') {
    addPublishLogEntry('✗ Error', 'error', data.message);
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish';
  } else {
    addPublishLogEntry(data.message, 'step');
    publishBtn.textContent = data.message;
  }
});

// Listen for deploy progress updates
window.electronAPI.onDeployProgress((data) => {
  if (data.step === 'complete') {
    addPublishLogEntry('✓ Deployment Complete', 'success', 'Website is now live on the internet!');
    deployBtn.disabled = false;
    deployBtn.textContent = 'Publish to Internet';
  } else if (data.step === 'error') {
    addPublishLogEntry('✗ Deploy Error', 'error', data.message);
    deployBtn.disabled = false;
    deployBtn.textContent = 'Publish to Internet';
  } else {
    addPublishLogEntry(data.message, 'step');
    deployBtn.textContent = data.message;
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    saveCurrentFile();
  }
});

// Functions

function cleanFilePath(filePath) {
  // Extract path after 'content/' for display
  const contentIndex = filePath.indexOf('content/');
  if (contentIndex !== -1) {
    return filePath.substring(contentIndex + 'content/'.length);
  }
  return filePath.split('/').slice(-3).join('/'); // fallback to last 3 parts
}

async function loadJsonFiles() {
  fileList.innerHTML = '<p class="loading">Loading files...</p>';

  const result = await window.electronAPI.getJsonFiles();

  if (result.success) {
    allJsonFiles = result.files;
    displayFileList(result.files);
  } else {
    fileList.innerHTML = `<p class="loading" style="color: #f48771;">Error: ${result.error}</p>`;
    showToast('Failed to load files', 'error');
  }
}

function displayFileList(files) {
  if (files.length === 0) {
    fileList.innerHTML = '<p class="loading">No JSON files found</p>';
    return;
  }

  fileList.innerHTML = '';

  // Group files by category
  const grouped = groupFilesByCategory(files);

  Object.keys(grouped).sort().forEach((category, index) => {
    // Create accordion section
    const accordionSection = document.createElement('div');
    accordionSection.className = 'accordion-section';

    // Create accordion header
    const accordionHeader = document.createElement('div');
    accordionHeader.className = 'accordion-header';
    if (index === 0) accordionHeader.classList.add('expanded'); // First section expanded by default

    const accordionTitle = document.createElement('div');
    accordionTitle.className = 'accordion-title';
    accordionTitle.textContent = category;

    const accordionActions = document.createElement('div');
    accordionActions.className = 'accordion-actions';

    // Add "+" button for manageable categories
    if (['home', 'photography', 'storyboard'].includes(category)) {
      const addBtn = document.createElement('button');
      addBtn.className = 'btn-add-file';
      addBtn.textContent = '+ New';
      addBtn.onclick = (e) => {
        e.stopPropagation();
        handleCreateFile(category);
      };
      accordionActions.appendChild(addBtn);
    }

    const accordionIcon = document.createElement('div');
    accordionIcon.className = 'accordion-icon';
    accordionIcon.textContent = '▶';

    accordionActions.appendChild(accordionIcon);

    accordionHeader.appendChild(accordionTitle);
    accordionHeader.appendChild(accordionActions);

    // Create accordion content
    const accordionContent = document.createElement('div');
    accordionContent.className = 'accordion-content';
    if (index === 0) accordionContent.classList.add('expanded'); // First section expanded by default

    grouped[category].forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.dataset.filePath = file;

      const fileName = file.split('/').pop();

      // File name container
      const fileNameContainer = document.createElement('div');
      fileNameContainer.style.flex = '1';
      fileNameContainer.style.cursor = 'pointer';

      const fileNameSpan = document.createElement('span');
      fileNameSpan.textContent = fileName;
      fileNameContainer.appendChild(fileNameSpan);

      const filePathDiv = document.createElement('div');
      filePathDiv.className = 'file-path';
      filePathDiv.textContent = cleanFilePath(file);
      fileNameContainer.appendChild(filePathDiv);

      fileNameContainer.addEventListener('click', () => loadFile(file));

      fileItem.appendChild(fileNameContainer);
      fileItem.style.display = 'flex';
      fileItem.style.alignItems = 'center';
      fileItem.style.justifyContent = 'space-between';

      // Add delete button for manageable categories
      if (['home', 'photography', 'storyboard'].includes(category)) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete-file';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          handleDeleteFile(file, category);
        };
        fileItem.appendChild(deleteBtn);
      }

      accordionContent.appendChild(fileItem);
    });

    // Add click handler for accordion
    accordionHeader.addEventListener('click', () => {
      const isExpanded = accordionHeader.classList.contains('expanded');

      if (isExpanded) {
        accordionHeader.classList.remove('expanded');
        accordionContent.classList.remove('expanded');
      } else {
        accordionHeader.classList.add('expanded');
        accordionContent.classList.add('expanded');
      }
    });

    accordionSection.appendChild(accordionHeader);
    accordionSection.appendChild(accordionContent);
    fileList.appendChild(accordionSection);
  });
}

function groupFilesByCategory(files) {
  const groups = {};

  files.forEach(file => {
    const parts = file.split('/');
    const contentIndex = parts.indexOf('content');
    const category = contentIndex >= 0 && parts[contentIndex + 1] ? parts[contentIndex + 1] : 'other';

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(file);
  });

  return groups;
}

async function loadFile(filePath) {
  currentFilePath = filePath;

  const result = await window.electronAPI.readJsonFile(filePath);

  if (result.success) {
    // Update UI
    emptyState.style.display = 'none';
    editorContainer.style.display = 'flex';

    const fileName = filePath.split('/').pop();
    currentFileName.textContent = fileName;

    // Store current data
    currentJsonData = result.data;
    jsonEditor.value = JSON.stringify(result.data, null, 2);

    // Display form view by default
    isFormView = true;
    renderFormView(result.data);
    formEditor.style.display = 'block';
    jsonEditor.style.display = 'none';
    toggleViewBtn.textContent = 'View Raw JSON';

    // Update active state in file list
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.filePath === filePath) {
        item.classList.add('active');
      }
    });
  } else {
    showToast(`Failed to load file: ${result.error}`, 'error');
  }
}

function renderFormView(data) {
  formEditor.innerHTML = '';

  if (Array.isArray(data)) {
    renderArrayField(formEditor, data, '');
  } else if (typeof data === 'object' && data !== null) {
    renderObjectFields(formEditor, data, '');
  } else {
    formEditor.innerHTML = '<p class="loading">Unable to render this data type</p>';
  }
}

function renderObjectFields(container, obj, path) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const fullPath = path ? `${path}.${key}` : key;

    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = key;
    formGroup.appendChild(label);

    if (isImageUrl(value)) {
      renderImageField(formGroup, fullPath, value);
    } else if (typeof value === 'string') {
      renderTextField(formGroup, fullPath, value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      renderTextField(formGroup, fullPath, String(value));
    } else if (Array.isArray(value)) {
      renderArrayField(formGroup, value, fullPath);
    } else if (typeof value === 'object' && value !== null) {
      const nested = document.createElement('div');
      nested.className = 'nested-field';
      renderObjectFields(nested, value, fullPath);
      formGroup.appendChild(nested);
    }

    container.appendChild(formGroup);
  });
}

function renderTextField(container, path, value) {
  const isLongText = value.length > 50;

  if (isLongText) {
    const textarea = document.createElement('textarea');
    textarea.className = 'form-textarea';
    textarea.value = value;
    textarea.dataset.path = path;
    container.appendChild(textarea);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input';
    input.value = value;
    input.dataset.path = path;
    container.appendChild(input);
  }
}

function renderImageField(container, path, url, lazyLoad = false) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'form-input';
  input.value = url;
  input.dataset.path = path;
  container.appendChild(input);

  const imageField = document.createElement('div');
  imageField.className = 'image-field';

  // Upload actions
  const imageActions = document.createElement('div');
  imageActions.className = 'image-actions';

  const uploadBtn = document.createElement('button');
  uploadBtn.type = 'button';
  uploadBtn.className = 'btn-upload';
  uploadBtn.textContent = 'Upload New Image';

  const uploadStatus = document.createElement('span');
  uploadStatus.className = 'upload-status';

  imageActions.appendChild(uploadBtn);
  imageActions.appendChild(uploadStatus);
  imageField.appendChild(imageActions);

  // Progress bar
  const progressContainer = document.createElement('div');
  progressContainer.className = 'upload-progress';
  progressContainer.style.display = 'none';

  const progressBar = document.createElement('div');
  progressBar.className = 'upload-progress-bar';
  progressBar.style.width = '0%';

  progressContainer.appendChild(progressBar);
  imageField.appendChild(progressContainer);

  // Image preview
  const preview = document.createElement('div');
  preview.className = 'image-preview';

  if (lazyLoad) {
    preview.innerHTML = '<div class="image-loading">Click to load image</div>';
    preview.style.cursor = 'pointer';
    preview.dataset.loaded = 'false';
    preview.dataset.url = url;

    // Load image on click
    preview.addEventListener('click', function loadImage() {
      if (preview.dataset.loaded === 'false') {
        preview.dataset.loaded = 'true';
        preview.style.cursor = 'default';
        loadImageIntoPreview(preview, url);
        preview.removeEventListener('click', loadImage);
      }
    });
  } else {
    preview.innerHTML = '<div class="image-loading">Loading image...</div>';
    loadImageIntoPreview(preview, url);
  }

  imageField.appendChild(preview);
  container.appendChild(imageField);

  // Set upload button handler after preview is created
  uploadBtn.onclick = () => handleImageUpload(input, path, preview, uploadStatus, progressBar);

  // Listen for input changes to update preview
  input.addEventListener('change', () => {
    const newUrl = input.value;
    if (newUrl) {
      preview.innerHTML = '<div class="image-loading">Loading image...</div>';
      preview.dataset.loaded = 'true';
      preview.style.cursor = 'default';
      loadImageIntoPreview(preview, newUrl);
    }
  });
}

// Helper function to load image into preview
function loadImageIntoPreview(preview, url) {
  preview.innerHTML = '<div class="image-loading">Loading image...</div>';

  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Image preview';

  img.onload = () => {
    preview.innerHTML = '';
    preview.appendChild(img);
  };

  img.onerror = () => {
    preview.innerHTML = '<div class="image-error">Failed to load image</div>';
  };
}

function renderArrayField(container, arr, path) {
  const arrayField = document.createElement('div');
  arrayField.className = 'array-field';

  // Check if this is a manageable thumbs array (photography_thumbs or storyboard_thumbs)
  const isManageable = currentFilePath && (
    currentFilePath.includes('photography_thumbs.json') ||
    currentFilePath.includes('storyboard_thumbs.json')
  );

  // Add header with Add button for manageable arrays
  if (isManageable) {
    const arrayHeader = document.createElement('div');
    arrayHeader.className = 'array-field-header';

    const arrayTitle = document.createElement('div');
    arrayTitle.className = 'array-field-title';
    arrayTitle.textContent = 'Items';

    const addItemBtn = document.createElement('button');
    addItemBtn.type = 'button';
    addItemBtn.className = 'btn-add-item';
    addItemBtn.textContent = '+ Add Item';
    addItemBtn.onclick = () => handleAddArrayItem(path);

    arrayHeader.appendChild(arrayTitle);
    arrayHeader.appendChild(addItemBtn);
    arrayField.appendChild(arrayHeader);
  }

  arr.forEach((item, index) => {
    const itemPath = path ? `${path}[${index}]` : `[${index}]`;
    const arrayItem = document.createElement('div');
    arrayItem.className = 'array-item';

    // Get title for accordion header
    let itemTitle = `Item ${index + 1}`;
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      if (item.title) itemTitle = item.title;
      else if (item.name) itemTitle = item.name;
      else if (item.imageName) itemTitle = item.imageName;
    }

    // Create accordion header
    const header = document.createElement('div');
    header.className = 'array-item-header';

    const title = document.createElement('div');
    title.className = 'array-item-title';
    title.textContent = itemTitle;
    title.style.flex = '1';

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.alignItems = 'center';
    headerActions.style.gap = '0.5rem';

    // Add delete button for manageable arrays
    if (isManageable) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete-item';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        await handleDeleteArrayItem(path, index, itemTitle);
      };
      headerActions.appendChild(deleteBtn);
    }

    const icon = document.createElement('div');
    icon.className = 'array-item-icon';
    icon.textContent = '▶';
    headerActions.appendChild(icon);

    header.appendChild(title);
    header.appendChild(headerActions);

    // Create accordion content
    const content = document.createElement('div');
    content.className = 'array-item-content';
    content.dataset.loaded = 'false';

    // Click handler for accordion
    header.addEventListener('click', () => {
      const isExpanded = header.classList.contains('expanded');

      // Close all other accordions in this array
      const allItems = arrayField.querySelectorAll('.array-item-header');
      allItems.forEach(otherHeader => {
        if (otherHeader !== header) {
          otherHeader.classList.remove('expanded');
          otherHeader.nextElementSibling.classList.remove('expanded');
        }
      });

      if (isExpanded) {
        header.classList.remove('expanded');
        content.classList.remove('expanded');
      } else {
        header.classList.add('expanded');
        content.classList.add('expanded');

        // Lazy load content on first expand
        if (content.dataset.loaded === 'false') {
          content.dataset.loaded = 'true';
          loadArrayItemContent(content, item, itemPath);
        }
      }
    });

    arrayItem.appendChild(header);
    arrayItem.appendChild(content);
    arrayField.appendChild(arrayItem);
  });

  container.appendChild(arrayField);
}

// Helper function to load array item content
function loadArrayItemContent(container, item, itemPath) {
  if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
    renderObjectFields(container, item, itemPath);
  } else if (typeof item === 'string') {
    if (isImageUrl(item)) {
      renderImageField(container, itemPath, item, true); // true = lazy load
    } else {
      renderTextField(container, itemPath, item);
    }
  } else {
    renderTextField(container, itemPath, String(item));
  }
}

function isImageUrl(value) {
  if (typeof value !== 'string') return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowerValue = value.toLowerCase();
  return imageExtensions.some(ext => lowerValue.includes(ext)) ||
         (lowerValue.includes('s3') && lowerValue.includes('amazonaws.com'));
}

function toggleView() {
  if (isFormView) {
    // Switch to JSON view
    // First collect form data
    const formData = collectFormData();
    jsonEditor.value = JSON.stringify(formData, null, 2);

    formEditor.style.display = 'none';
    jsonEditor.style.display = 'block';
    toggleViewBtn.textContent = 'View Form';
    isFormView = false;
  } else {
    // Switch to form view
    try {
      const jsonData = JSON.parse(jsonEditor.value);
      currentJsonData = jsonData;
      renderFormView(jsonData);

      formEditor.style.display = 'block';
      jsonEditor.style.display = 'none';
      toggleViewBtn.textContent = 'View Raw JSON';
      isFormView = true;
    } catch (e) {
      showToast(`Invalid JSON: ${e.message}`, 'error');
    }
  }
}

function collectFormData() {
  const inputs = formEditor.querySelectorAll('input, textarea');
  const data = JSON.parse(JSON.stringify(currentJsonData)); // Deep clone

  inputs.forEach(input => {
    const path = input.dataset.path;
    if (!path) return;

    const value = input.value;
    setValueByPath(data, path, value);
  });

  return data;
}

function setValueByPath(obj, path, value) {
  const parts = path.match(/([^\[\].]+)|\[(\d+)\]/g).map(p => p.replace(/[\[\]]/g, ''));
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    if (!isNaN(nextPart)) {
      // Next part is array index
      if (!current[part]) current[part] = [];
      current = current[part];
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }

  const lastPart = parts[parts.length - 1];
  // Try to preserve type
  const originalValue = getValueByPath(obj, path);
  if (typeof originalValue === 'number') {
    current[lastPart] = Number(value) || 0;
  } else if (typeof originalValue === 'boolean') {
    current[lastPart] = value === 'true';
  } else {
    current[lastPart] = value;
  }
}

function getValueByPath(obj, path) {
  const parts = path.match(/([^\[\].]+)|\[(\d+)\]/g).map(p => p.replace(/[\[\]]/g, ''));
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

async function saveCurrentFile() {
  if (!currentFilePath) return;

  let dataToSave;

  if (isFormView) {
    // Collect data from form
    dataToSave = collectFormData();
  } else {
    // Get data from JSON editor
    try {
      dataToSave = JSON.parse(jsonEditor.value);
    } catch (e) {
      showToast(`Invalid JSON: ${e.message}`, 'error');
      return;
    }
  }

  const content = JSON.stringify(dataToSave, null, 2);

  const result = await window.electronAPI.writeJsonFile(currentFilePath, content);

  if (result.success) {
    showToast('File saved successfully');
    currentJsonData = dataToSave;

    // Refresh the current view
    if (isFormView) {
      renderFormView(dataToSave);
    } else {
      jsonEditor.value = content;
    }
  } else {
    showToast(`Failed to save file: ${result.error}`, 'error');
  }
}

// Image upload handler
async function handleImageUpload(input, path, preview, uploadStatus, progressBar) {
  // Check if S3 is configured
  const configResult = await window.electronAPI.s3IsConfigured();
  if (!configResult.configured) {
    showToast('S3 not configured. Please add credentials to s3-config.json', 'error');
    return;
  }

  // Open file picker
  const fileResult = await window.electronAPI.selectImageFile();

  if (fileResult.canceled) {
    return;
  }

  if (!fileResult.success) {
    showToast(`Failed to select file: ${fileResult.error}`, 'error');
    return;
  }

  const localFilePath = fileResult.filePath;
  const fileName = localFilePath.split('/').pop();

  // Extract current S3 key structure from URL or create new one
  const currentUrl = input.value;
  let s3Key;

  if (currentUrl.includes('amazonaws.com/')) {
    // Extract the path part after the bucket URL
    const urlParts = currentUrl.split('amazonaws.com/');
    const existingKey = urlParts[1];
    const keyParts = existingKey.split('/');
    keyParts[keyParts.length - 1] = fileName; // Replace filename but keep folder structure
    s3Key = keyParts.join('/');
  } else {
    // Create new S3 key based on current file path
    const category = currentFilePath.includes('/photography/') ? 'photography' :
                     currentFilePath.includes('/storyboard/') ? 'storyboard' :
                     currentFilePath.includes('/work/') ? 'work' :
                     currentFilePath.includes('/home/') ? 'home' : 'uploads';
    s3Key = `${category}/${fileName}`;
  }

  // Show upload progress
  uploadStatus.textContent = 'Uploading...';
  uploadStatus.className = 'upload-status uploading';
  progressBar.parentElement.style.display = 'block';
  progressBar.style.width = '0%';

  // Setup progress listener
  const progressListener = (data) => {
    progressBar.style.width = `${data.percentage}%`;
  };
  window.electronAPI.onUploadProgress(progressListener);

  // Upload file
  const uploadResult = await window.electronAPI.uploadToS3(localFilePath, s3Key);

  // Hide progress
  progressBar.parentElement.style.display = 'none';

  if (uploadResult.success) {
    // Update input with new URL
    input.value = uploadResult.url;
    uploadStatus.textContent = 'Upload successful!';
    uploadStatus.className = 'upload-status';

    // Update preview
    preview.innerHTML = '<div class="image-loading">Loading image...</div>';
    const newImg = document.createElement('img');
    newImg.src = uploadResult.url;
    newImg.alt = 'Image preview';

    newImg.onload = () => {
      preview.innerHTML = '';
      preview.appendChild(newImg);
    };

    newImg.onerror = () => {
      preview.innerHTML = '<div class="image-error">Failed to load image</div>';
    };

    showToast('Image uploaded successfully!');

    // Clear status after 3 seconds
    setTimeout(() => {
      uploadStatus.textContent = '';
    }, 3000);
  } else {
    uploadStatus.textContent = `Upload failed: ${uploadResult.error}`;
    uploadStatus.className = 'upload-status error';
    showToast(`Upload failed: ${uploadResult.error}`, 'error');
  }
}

async function showAllS3Urls() {
  allUrlsContent.innerHTML = '<p class="loading">Scanning files...</p>';
  modal.style.display = 'block';

  const result = await window.electronAPI.findS3Urls();

  if (result.success) {
    if (result.urlMap.length === 0) {
      allUrlsContent.innerHTML = '<p style="color: #888;">No S3 URLs found in any files</p>';
      return;
    }

    allUrlsContent.innerHTML = '';
    result.urlMap.forEach(({ file, urls }) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'url-group';

      const header = document.createElement('h3');
      header.textContent = cleanFilePath(file);
      groupDiv.appendChild(header);

      const urlList = document.createElement('ul');
      urls.forEach(url => {
        const li = document.createElement('li');
        li.textContent = url;
        urlList.appendChild(li);
      });

      groupDiv.appendChild(urlList);
      allUrlsContent.appendChild(groupDiv);
    });
  } else {
    allUrlsContent.innerHTML = `<p style="color: #f48771;">Error: ${result.error}</p>`;
  }
}

function addPublishLogEntry(message, type = 'info', details = null) {
  const entry = document.createElement('div');
  entry.className = `publish-log-entry ${type}`;

  const timestamp = document.createElement('div');
  timestamp.className = 'publish-log-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString();
  entry.appendChild(timestamp);

  const messageDiv = document.createElement('div');
  messageDiv.className = 'publish-log-message';
  messageDiv.textContent = message;
  entry.appendChild(messageDiv);

  if (details) {
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'publish-log-details';
    detailsDiv.textContent = details;
    entry.appendChild(detailsDiv);
  }

  publishLog.appendChild(entry);
  // Auto-scroll to bottom
  publishLog.scrollTop = publishLog.scrollHeight;
}

async function handlePublish() {
  // Clear previous log and show modal
  publishLog.innerHTML = '';
  publishModal.style.display = 'block';

  // Disable button during publish
  publishBtn.disabled = true;
  publishBtn.textContent = 'Checking for changes...';

  addPublishLogEntry('Starting publish process...', 'info');

  try {
    // Check if there are changes
    addPublishLogEntry('Checking for content changes...', 'step');
    const checkResult = await window.electronAPI.checkContentChanges();

    if (!checkResult.success) {
      addPublishLogEntry('Failed to check changes', 'error', checkResult.error);
      showToast(`Error checking changes: ${checkResult.error}`, 'error');
      publishBtn.disabled = false;
      publishBtn.textContent = 'Publish';
      return;
    }

    if (!checkResult.hasChanges) {
      addPublishLogEntry('No changes detected', 'info', 'Content is up to date with the main project');
      showToast('No changes detected. Website is up to date.', 'success');
      publishBtn.disabled = false;
      publishBtn.textContent = 'Publish';
      return;
    }

    // Show changes summary in log
    const changeTypes = {
      new: checkResult.changes.filter(c => c.type === 'new').length,
      modified: checkResult.changes.filter(c => c.type === 'modified').length,
      deleted: checkResult.changes.filter(c => c.type === 'deleted').length
    };

    const changeSummary = [];
    if (changeTypes.new > 0) changeSummary.push(`${changeTypes.new} new`);
    if (changeTypes.modified > 0) changeSummary.push(`${changeTypes.modified} modified`);
    if (changeTypes.deleted > 0) changeSummary.push(`${changeTypes.deleted} deleted`);

    // Create detailed change list for log
    const changeListHTML = document.createElement('div');
    changeListHTML.className = 'publish-log-details';
    const changeList = document.createElement('ul');
    changeList.className = 'publish-changes-list';

    checkResult.changes.slice(0, 10).forEach(change => {
      const li = document.createElement('li');
      li.className = `change-${change.type}`;
      li.textContent = `[${change.type.toUpperCase()}] ${change.path}`;
      changeList.appendChild(li);
    });

    if (checkResult.changes.length > 10) {
      const li = document.createElement('li');
      li.textContent = `... and ${checkResult.changes.length - 10} more changes`;
      changeList.appendChild(li);
    }

    const entry = document.createElement('div');
    entry.className = 'publish-log-entry info';

    const timestamp = document.createElement('div');
    timestamp.className = 'publish-log-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    entry.appendChild(timestamp);

    const messageDiv = document.createElement('div');
    messageDiv.className = 'publish-log-message';
    messageDiv.textContent = `Found ${checkResult.changes.length} change(s): ${changeSummary.join(', ')}`;
    entry.appendChild(messageDiv);

    entry.appendChild(changeList);
    publishLog.appendChild(entry);
    publishLog.scrollTop = publishLog.scrollHeight;

    const confirmMsg = `Found changes:\n${changeSummary.join(', ')}\n\nThis will:\n1. Build the website from your content\n2. Generate HTML/CSS files in dist/website\n\nProceed with publish?`;

    if (!confirm(confirmMsg)) {
      addPublishLogEntry('Publish cancelled by user', 'info');
      publishBtn.disabled = false;
      publishBtn.textContent = 'Publish';
      return;
    }

    // Start publish process
    addPublishLogEntry('User confirmed - starting publish...', 'step');
    publishBtn.textContent = 'Publishing...';
    const result = await window.electronAPI.publishWebsite();

    if (result.success) {
      showToast(`Website published successfully! Output: ${result.outputPath}`, 'success');
    } else {
      showToast(`Publish failed: ${result.error}`, 'error');
    }

  } catch (error) {
    addPublishLogEntry('Unexpected error', 'error', error.message);
    showToast(`Unexpected error: ${error.message}`, 'error');
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish';
  }
}

async function handleDeploy() {
  // Show modal with deployment log
  publishModal.style.display = 'block';

  // Disable button during deployment
  deployBtn.disabled = true;
  deployBtn.textContent = 'Deploying...';

  addPublishLogEntry('Starting deployment to S3...', 'info');

  try {
    // Start deployment
    const result = await window.electronAPI.deployWebsite();

    if (result.success) {
      addPublishLogEntry('✓ Deployment successful!', 'success', `Website is live at: https://aitormaguregiportfolio.s3.amazonaws.com/index.html`);
      showToast('Website deployed successfully!', 'success');
    } else {
      addPublishLogEntry('✗ Deployment failed', 'error', result.error);
      showToast(`Deployment failed: ${result.error}`, 'error');
      deployBtn.disabled = false;
      deployBtn.textContent = 'Publish to Internet';
    }
  } catch (error) {
    addPublishLogEntry('Unexpected deployment error', 'error', error.message);
    showToast(`Unexpected error: ${error.message}`, 'error');
    deployBtn.disabled = false;
    deployBtn.textContent = 'Publish to Internet';
  }
}

function showToast(message, type = 'success', action = null) {
  // Clear any existing toast timeout
  if (currentToastTimeout) {
    clearTimeout(currentToastTimeout);
  }

  // Clear toast content
  toast.innerHTML = '';
  toast.className = 'toast show';

  if (type === 'error') {
    toast.classList.add('error');
  } else if (type === 'warning') {
    toast.classList.add('warning');
  }

  // Add message
  const messageSpan = document.createElement('span');
  messageSpan.className = 'toast-message';
  messageSpan.textContent = message;
  toast.appendChild(messageSpan);

  // Add action button if provided
  if (action) {
    const actionBtn = document.createElement('button');
    actionBtn.className = 'toast-action';
    actionBtn.textContent = action.text;
    actionBtn.onclick = () => {
      action.callback();
      hideToast();
    };
    toast.appendChild(actionBtn);
  }

  // Auto-hide toast (longer timeout if action button present)
  const timeout = action ? 10000 : 3000;
  currentToastTimeout = setTimeout(() => {
    hideToast();
  }, timeout);
}

function hideToast() {
  toast.classList.remove('show');
  if (currentToastTimeout) {
    clearTimeout(currentToastTimeout);
    currentToastTimeout = null;
  }
}

// File Management Functions

// Helper: Auto-generate next URL based on last item
async function generateNextUrl(category, files = null) {
  let lastUrl = '';

  if (category === 'home') {
    // Find last home file
    const homeFiles = allJsonFiles.filter(f => f.includes('/home/home'));
    if (homeFiles.length > 0) {
      const lastFile = homeFiles[homeFiles.length - 1];
      const result = await window.electronAPI.readJsonFile(lastFile);
      if (result.success && result.data.src) {
        lastUrl = result.data.src;
      }
    }
  } else if (category === 'photography') {
    // Find last photography file
    const photoFiles = allJsonFiles.filter(f => f.includes('/photography/photography-'));
    if (photoFiles.length > 0) {
      const lastFile = photoFiles[photoFiles.length - 1];
      const result = await window.electronAPI.readJsonFile(lastFile);
      if (result.success && result.data.image) {
        lastUrl = result.data.image;
      }
    }
  } else if (category === 'storyboard') {
    // Find last storyboard file
    const storyFiles = allJsonFiles.filter(f => f.includes('/storyboard/storyboard-'));
    if (storyFiles.length > 0) {
      const lastFile = storyFiles[storyFiles.length - 1];
      const result = await window.electronAPI.readJsonFile(lastFile);
      if (result.success && result.data.images && result.data.images.length > 0) {
        lastUrl = result.data.images[0];
      }
    }
  }

  return incrementUrlNumber(lastUrl);
}

// Helper: Increment number in URL
function incrementUrlNumber(url) {
  if (!url) return '';

  // Match numbers at the end of the filename (before extension)
  // Example: photo-23.jpg -> photo-24.jpg
  const match = url.match(/^(.+?)(\d+)(\.[^.]+)$/);
  if (match) {
    const [, prefix, number, extension] = match;
    const nextNumber = parseInt(number) + 1;
    // Preserve leading zeros if present
    const paddedNumber = number.startsWith('0')
      ? String(nextNumber).padStart(number.length, '0')
      : String(nextNumber);
    return `${prefix}${paddedNumber}${extension}`;
  }

  return url; // Return original if no number pattern found
}

// Helper: Extract S3 URLs from JSON data
function extractS3UrlsFromData(data) {
  const s3Regex = /https?:\/\/[a-zA-Z0-9\-]+\.s3[a-zA-Z0-9\-\.]*\.amazonaws\.com\/[^\s"'}\]]+/g;
  const jsonString = JSON.stringify(data);
  const matches = jsonString.match(s3Regex) || [];
  // Return unique URLs
  return [...new Set(matches)];
}

// Helper: Delete S3 images
async function deleteS3Images(urls) {
  if (!urls || urls.length === 0) return { success: true, deletedCount: 0 };

  let deletedCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const url of urls) {
    const result = await window.electronAPI.deleteFromS3(url);
    if (result.success) {
      deletedCount++;
    } else {
      failedCount++;
      errors.push(`${url}: ${result.error}`);
    }
  }

  return {
    success: failedCount === 0,
    deletedCount,
    failedCount,
    errors
  };
}

async function handleCreateFile(category) {
  // Get next available number
  const numberResult = await window.electronAPI.getNextNumber(category);

  if (!numberResult.success) {
    showToast(`Failed to get next number: ${numberResult.error}`, 'error');
    return;
  }

  const nextNum = numberResult.nextNumber;

  // Generate next URL based on last item
  const autoGeneratedUrl = await generateNextUrl(category);

  let fileName, initialData;

  if (category === 'home') {
    fileName = `home${nextNum}.json`;
    initialData = {
      imageName: "New Image",
      src: autoGeneratedUrl
    };
  } else if (category === 'photography') {
    fileName = `photography${nextNum}.json`;
    initialData = {
      title: "New Photography",
      description: "",
      image: autoGeneratedUrl
    };
  } else if (category === 'storyboard') {
    fileName = `storyboard${nextNum}.json`;
    initialData = {
      title: "New Storyboard",
      description: "",
      images: autoGeneratedUrl ? [autoGeneratedUrl] : []
    };
  }

  const result = await window.electronAPI.createJsonFile(category, fileName, initialData);

  if (result.success) {
    showToast(`Created ${fileName}`);
    // Refresh file list
    await loadJsonFiles();
    // Load the new file
    loadFile(result.filePath);
  } else {
    showToast(`Failed to create file: ${result.error}`, 'error');
  }
}

async function handleDeleteFile(filePath, category) {
  const fileName = filePath.split('/').pop();

  // Don't delete thumbs files
  if (fileName.includes('_thumbs.json')) {
    showToast('Cannot delete thumbs files', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
    return;
  }

  // Read file content before deleting (for undo)
  const readResult = await window.electronAPI.readJsonFile(filePath);
  if (!readResult.success) {
    showToast('Failed to read file before deletion', 'error');
    return;
  }

  const fileContent = readResult.rawContent;
  const wasCurrentFile = currentFilePath === filePath;

  // Extract S3 URLs from file
  const s3Urls = extractS3UrlsFromData(readResult.data);

  // Ask about S3 deletion if there are S3 URLs
  let deleteFromS3 = false;
  if (s3Urls.length > 0) {
    const urlList = s3Urls.map(url => url.split('/').pop()).join(', ');
    deleteFromS3 = confirm(
      `This file contains ${s3Urls.length} S3 image(s):\n${urlList}\n\nDo you want to delete these images from S3 as well?`
    );
  }

  // Delete the file
  const result = await window.electronAPI.deleteJsonFile(filePath);

  if (result.success) {
    // Save deletion to history
    const deletion = {
      type: 'file',
      filePath,
      fileName,
      category,
      content: fileContent,
      wasCurrentFile,
      timestamp: Date.now()
    };
    deletionHistory.push(deletion);

    // Keep only last 10 deletions
    if (deletionHistory.length > 10) {
      deletionHistory.shift();
    }

    // If this was the currently open file, clear the editor
    if (wasCurrentFile) {
      currentFilePath = null;
      editorContainer.style.display = 'none';
      emptyState.style.display = 'flex';
    }

    // Refresh file list
    await loadJsonFiles();

    // Delete from S3 if user confirmed
    if (deleteFromS3 && s3Urls.length > 0) {
      const s3Result = await deleteS3Images(s3Urls);
      if (s3Result.success) {
        showToast(`Deleted ${fileName} and ${s3Result.deletedCount} S3 image(s)`, 'warning', {
          text: 'Undo',
          callback: () => undoFileDeletion(deletion)
        });
      } else {
        showToast(`Deleted ${fileName} but failed to delete ${s3Result.failedCount} S3 image(s)`, 'warning', {
          text: 'Undo',
          callback: () => undoFileDeletion(deletion)
        });
      }
    } else {
      // Show toast with undo option
      showToast(`Deleted ${fileName}`, 'warning', {
        text: 'Undo',
        callback: () => undoFileDeletion(deletion)
      });
    }
  } else {
    showToast(`Failed to delete file: ${result.error}`, 'error');
  }
}

async function undoFileDeletion(deletion) {
  showToast('Restoring file...', 'success');

  // Re-create the file
  const result = await window.electronAPI.writeJsonFile(deletion.filePath, deletion.content);

  if (result.success) {
    showToast(`Restored ${deletion.fileName}`);

    // Remove from deletion history
    const index = deletionHistory.indexOf(deletion);
    if (index > -1) {
      deletionHistory.splice(index, 1);
    }

    // Refresh file list
    await loadJsonFiles();

    // Reload the file if it was currently open
    if (deletion.wasCurrentFile) {
      loadFile(deletion.filePath);
    }
  } else {
    showToast(`Failed to restore file: ${result.error}`, 'error');
  }
}

// Array Item Management Functions

function handleAddArrayItem(path) {
  // Get the current data
  const data = collectFormData();

  // Generate next URL based on last item in array
  let autoGeneratedUrl = '';
  if (Array.isArray(data) && data.length > 0) {
    const lastItem = data[data.length - 1];
    if (lastItem.thumbUrl) {
      autoGeneratedUrl = incrementUrlNumber(lastItem.thumbUrl);
    }
  }

  // Determine default item structure based on file type
  let newItem;
  if (currentFilePath.includes('photography_thumbs')) {
    newItem = {
      title: "New Photography",
      thumbUrl: autoGeneratedUrl
    };
  } else if (currentFilePath.includes('storyboard_thumbs')) {
    newItem = {
      title: "New Storyboard",
      thumbUrl: autoGeneratedUrl
    };
  }

  // Add the new item to the array
  if (Array.isArray(data)) {
    data.push(newItem);
  }

  // Update the current data and re-render
  currentJsonData = data;
  renderFormView(data);
  showToast('Item added - remember to save!');
}

async function handleDeleteArrayItem(path, index, itemTitle) {
  if (!confirm(`Are you sure you want to delete "${itemTitle}"?`)) {
    return;
  }

  // Get the current data
  const data = collectFormData();

  // Save the item before deleting (for undo)
  let deletedItem = null;
  if (Array.isArray(data) && index < data.length) {
    deletedItem = JSON.parse(JSON.stringify(data[index])); // Deep clone
  }

  // Extract S3 URLs from the item
  const s3Urls = extractS3UrlsFromData(deletedItem);

  // Ask about S3 deletion if there are S3 URLs
  let deleteFromS3 = false;
  if (s3Urls.length > 0) {
    const urlList = s3Urls.map(url => url.split('/').pop()).join(', ');
    deleteFromS3 = confirm(
      `This item contains ${s3Urls.length} S3 image(s):\n${urlList}\n\nDo you want to delete these images from S3 as well?`
    );
  }

  // Remove the item from the array
  if (Array.isArray(data)) {
    data.splice(index, 1);
  }

  // Save deletion to history
  const deletion = {
    type: 'arrayItem',
    filePath: currentFilePath,
    index,
    item: deletedItem,
    itemTitle,
    timestamp: Date.now()
  };
  deletionHistory.push(deletion);

  // Keep only last 10 deletions
  if (deletionHistory.length > 10) {
    deletionHistory.shift();
  }

  // Update the current data and re-render
  currentJsonData = data;
  renderFormView(data);

  // Delete from S3 if user confirmed
  if (deleteFromS3 && s3Urls.length > 0) {
    const s3Result = await deleteS3Images(s3Urls);
    if (s3Result.success) {
      showToast(`Deleted "${itemTitle}" and ${s3Result.deletedCount} S3 image(s) - remember to save!`, 'warning', {
        text: 'Undo',
        callback: () => undoArrayItemDeletion(deletion)
      });
    } else {
      showToast(`Deleted "${itemTitle}" but failed to delete ${s3Result.failedCount} S3 image(s) - remember to save!`, 'warning', {
        text: 'Undo',
        callback: () => undoArrayItemDeletion(deletion)
      });
    }
  } else {
    // Show toast with undo option
    showToast(`Deleted "${itemTitle}" - remember to save!`, 'warning', {
      text: 'Undo',
      callback: () => undoArrayItemDeletion(deletion)
    });
  }
}

function undoArrayItemDeletion(deletion) {
  // Get current data
  const data = collectFormData();

  // Re-insert the item at its original position
  if (Array.isArray(data) && deletion.item) {
    data.splice(deletion.index, 0, deletion.item);
  }

  // Remove from deletion history
  const historyIndex = deletionHistory.indexOf(deletion);
  if (historyIndex > -1) {
    deletionHistory.splice(historyIndex, 1);
  }

  // Update the current data and re-render
  currentJsonData = data;
  renderFormView(data);

  showToast(`Restored "${deletion.itemTitle}" - remember to save!`);
}
