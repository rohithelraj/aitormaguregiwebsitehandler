# Changelog

All notable changes to the Aitor Content Manager will be documented in this file.

## [Unreleased]

### Added
- **Undo deletions** - Revert file or item deletions within 10 seconds
- **Deletion history** - Keeps last 10 deletions in memory for undo
- **Undo button in toast** - Click "Undo" button that appears after any deletion
- **Create new JSON files** - Add new files for home, photography, and storyboard categories
- **Delete JSON files** - Remove unwanted files with confirmation
- **Add array items** - Create new items in photography_thumbs.json and storyboard_thumbs.json
- **Delete array items** - Remove items from thumb arrays with confirmation
- **Auto-numbering** - Automatically assigns next available number to new files
- **Folder management** - Automatically creates and cleans up subdirectories for photography and storyboard
- **"+ New" button** - Visible on manageable category headers in sidebar
- **Delete button (×)** - Appears on hover for deletable files
- **"+ Add Item" button** - Available in thumbs file arrays
- **Delete button** - On each array item accordion for easy removal
- **Accordion UI for array items** - Each item in arrays is now collapsible
- **One-at-a-time accordion** - Only one array item can be expanded at a time for better performance
- **Lazy loading for images** - Images in accordions only load when expanded
- **Click to load images** - Lazy-loaded images show "Click to load image" placeholder
- **Smart accordion titles** - Uses `title`, `name`, or `imageName` properties for accordion headers
- **S3 image upload** - Upload new images directly to S3 bucket
- **AWS SDK integration** - Full S3 upload with progress tracking
- **Upload progress bar** - Real-time upload progress indication
- **S3 configuration** - Secure credentials management via s3-config.json
- **Form-based JSON editing** - Edit JSON through intuitive form fields
- **Image thumbnail previews** - Automatic image preview for S3 URLs
- **Dual view mode** - Toggle between form and raw JSON editing
- **Collapsible file categories** - Accordion sidebar for file organization
- **Auto-save with type preservation** - Maintains JSON data types when saving

### Changed
- Array items now render as accordions instead of flat list
- Image loading is deferred for better performance with large arrays
- Form editor now uses accordion for better organization

### Performance
- Reduced initial load time for files with many images (like photography_thumbs.json)
- Browser no longer tries to load all images simultaneously
- Memory usage reduced when viewing large image collections

### Safety
- All deletions can be undone within 10 seconds
- File content backed up before deletion
- Array items restored at original position when undone
- 10-deletion history buffer prevents accidental data loss

## [1.0.0] - 2024-11-21

### Added
- Initial release
- Electron desktop application
- JSON file browser with category organization
- Read and write JSON files
- S3 URL detection and management
- Dark theme UI
