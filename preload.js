const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getJsonFiles: () => ipcRenderer.invoke('get-json-files'),
  readJsonFile: (filePath) => ipcRenderer.invoke('read-json-file', filePath),
  writeJsonFile: (filePath, content) => ipcRenderer.invoke('write-json-file', filePath, content),
  findS3Urls: () => ipcRenderer.invoke('find-s3-urls'),

  // File management
  createJsonFile: (category, fileName, initialData) => ipcRenderer.invoke('create-json-file', category, fileName, initialData),
  deleteJsonFile: (filePath) => ipcRenderer.invoke('delete-json-file', filePath),
  getNextNumber: (category) => ipcRenderer.invoke('get-next-number', category),

  // S3 operations
  s3IsConfigured: () => ipcRenderer.invoke('s3-is-configured'),
  selectImageFile: () => ipcRenderer.invoke('select-image-file'),
  uploadToS3: (filePath, s3Key) => ipcRenderer.invoke('upload-to-s3', filePath, s3Key),
  deleteFromS3: (s3Url) => ipcRenderer.invoke('delete-from-s3', s3Url),
  onUploadProgress: (callback) => ipcRenderer.on('upload-progress', (event, data) => callback(data)),
});
