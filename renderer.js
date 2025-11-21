let currentFilePath = null;
let allJsonFiles = [];
let currentJsonData = null;
let isFormView = true;

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
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const allUrlsContent = document.getElementById('allUrlsContent');
const toast = document.getElementById('toast');

// Initialize
loadJsonFiles();

// Event Listeners
refreshBtn.addEventListener('click', loadJsonFiles);
saveBtn.addEventListener('click', saveCurrentFile);
toggleViewBtn.addEventListener('click', toggleView);
findUrlsBtn.addEventListener('click', showAllS3Urls);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
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

    const accordionIcon = document.createElement('div');
    accordionIcon.className = 'accordion-icon';
    accordionIcon.textContent = '▶';

    accordionHeader.appendChild(accordionTitle);
    accordionHeader.appendChild(accordionIcon);

    // Create accordion content
    const accordionContent = document.createElement('div');
    accordionContent.className = 'accordion-content';
    if (index === 0) accordionContent.classList.add('expanded'); // First section expanded by default

    grouped[category].forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.dataset.filePath = file;

      const fileName = file.split('/').pop();
      const filePathDiv = document.createElement('div');
      filePathDiv.className = 'file-path';
      filePathDiv.textContent = cleanFilePath(file);

      fileItem.textContent = fileName;
      fileItem.appendChild(filePathDiv);

      fileItem.addEventListener('click', () => loadFile(file));

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

function renderImageField(container, path, url) {
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
  uploadBtn.onclick = () => handleImageUpload(input, path, preview, uploadStatus, progressBar);

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

  imageField.appendChild(preview);
  container.appendChild(imageField);

  // Listen for input changes to update preview
  input.addEventListener('change', () => {
    const newUrl = input.value;
    if (newUrl) {
      preview.innerHTML = '<div class="image-loading">Loading image...</div>';
      const newImg = document.createElement('img');
      newImg.src = newUrl;
      newImg.alt = 'Image preview';

      newImg.onload = () => {
        preview.innerHTML = '';
        preview.appendChild(newImg);
      };

      newImg.onerror = () => {
        preview.innerHTML = '<div class="image-error">Failed to load image</div>';
      };
    }
  });
}

function renderArrayField(container, arr, path) {
  const arrayField = document.createElement('div');
  arrayField.className = 'array-field';

  arr.forEach((item, index) => {
    const itemPath = path ? `${path}[${index}]` : `[${index}]`;
    const arrayItem = document.createElement('div');
    arrayItem.className = 'array-item';

    const itemLabel = document.createElement('div');
    itemLabel.className = 'form-label';
    itemLabel.textContent = `Item ${index + 1}`;
    arrayItem.appendChild(itemLabel);

    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      renderObjectFields(arrayItem, item, itemPath);
    } else if (typeof item === 'string') {
      if (isImageUrl(item)) {
        renderImageField(arrayItem, itemPath, item);
      } else {
        renderTextField(arrayItem, itemPath, item);
      }
    } else {
      renderTextField(arrayItem, itemPath, String(item));
    }

    arrayField.appendChild(arrayItem);
  });

  container.appendChild(arrayField);
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

function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = 'toast show';
  if (type === 'error') {
    toast.classList.add('error');
  }

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
