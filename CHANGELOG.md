# Changelog

All notable changes to the Aitor Content Manager will be documented in this file.

## [Unreleased]

### Added
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

## [1.0.0] - 2024-11-21

### Added
- Initial release
- Electron desktop application
- JSON file browser with category organization
- Read and write JSON files
- S3 URL detection and management
- Dark theme UI
