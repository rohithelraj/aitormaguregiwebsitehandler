# Aitor Content Manager

An Electron desktop application for managing JSON content files and S3 bucket URLs for the Aitor Maguregi Digital Visual Artist portfolio.

## Features

- **Browse JSON Files**: View all JSON files from the content directory organized by category with collapsible accordion sections
- **Create/Delete Files**: Add new JSON files for home, photography, and storyboard categories
- **Undo Deletions**: Revert any file or item deletion within 10 seconds with one click
- **Manage Array Items**: Add and delete items in photography_thumbs.json and storyboard_thumbs.json
- **Form-Based Editing**: Edit JSON content through intuitive form fields with proper labels
- **Image Thumbnails**: Automatically displays image previews for S3 URLs and image fields
- **S3 Image Upload**: Upload new images directly to S3 bucket with progress tracking
- **Dual View Mode**: Toggle between form view and raw JSON editing
- **S3 URL Management**: View and update S3 bucket URLs with live image previews
- **Auto-Save**: Preserves data structure and types when saving from form view
- **Find All S3 URLs**: Scan all files and display a comprehensive list of S3 URLs

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## S3 Configuration

To enable image uploads to S3, you need to configure your AWS credentials.

### Quick Setup

1. **Create dedicated IAM user** (recommended for security)
   - See detailed guide: **[AWS_SETUP.md](./AWS_SETUP.md)** 📖
   - This creates a user with minimal permissions for this app only

2. **Add credentials** to `s3-config.json`:

```json
{
  "region": "us-east-1",
  "bucket": "aitormaguregiportfolioresources",
  "accessKeyId": "YOUR_ACCESS_KEY_ID",
  "secretAccessKey": "YOUR_SECRET_ACCESS_KEY"
}
```

**Security Note:** The `s3-config.json` file is excluded from git to protect your credentials. A template file `s3-config.example.json` is provided for reference.

### Required Permissions

Your IAM user needs these S3 permissions:
- `s3:PutObject` - Upload files
- `s3:PutObjectAcl` - Set public-read ACL
- `s3:DeleteObject` - Delete files from S3 when deleting content
- `s3:ListBucket` - List bucket contents (optional)

**📚 Full AWS setup instructions: [AWS_SETUP.md](./AWS_SETUP.md)**

## Usage

### Starting the App

```bash
npm start
```

### Features Overview

1. **File Browser (Left Sidebar)**
   - Lists all JSON files grouped by category in collapsible accordions
   - Click category headers to expand/collapse sections
   - **"+ New" button** on home, photography, and storyboard categories
   - **Delete button (×)** appears on hover for manageable files
   - Click any file to open it in the editor
   - Automatically creates folders for photography and storyboard files

2. **Form Editor (Main Panel - Default View)**
   - Edit JSON data through intuitive form fields
   - **Accordion for array items** - each item is collapsible
   - **Only one accordion open at a time** - improves performance
   - **"+ Add Item" button** for thumbs files (photography_thumbs.json, storyboard_thumbs.json)
   - **Delete button** on each array item accordion for removal
   - **Lazy loading** - images only load when accordion is expanded
   - Image fields automatically display thumbnails
   - Labels are auto-generated from JSON keys
   - Supports nested objects and arrays

3. **Toolbar Actions**
   - **Refresh Files**: Reload the file list
   - **Find All S3 URLs**: View all S3 URLs across all JSON files
   - **View Raw JSON / View Form**: Toggle between form and JSON editor
   - **Save Changes**: Save modifications (or use Cmd/Ctrl+S)

4. **Image Handling & Upload**
   - Automatically detects image URLs (S3 URLs and common image extensions)
   - Displays thumbnails below input fields
   - **Upload New Image** button on each image field
   - Click to select local image file (jpg, png, gif, webp, svg)
   - Real-time upload progress bar
   - Automatically updates JSON with new S3 URL
   - Preserves folder structure in S3 bucket
   - Shows loading states and error messages

### Creating New Files

**For Photography and Storyboard:**
1. Expand the category in the sidebar
2. Click the **"+ New"** button in the header
3. A new file is automatically created with the next available number
   - Photography: `photography-N/photographyN.json`
   - Storyboard: `storyboard-N/storyboardN.json`
4. The file opens automatically in the editor
5. Fill in the details and click **Save**

**For Home:**
1. Expand the home category
2. Click the **"+ New"** button
3. Creates `homeN.json` with next available number
4. Edit and save

### Deleting Files

1. Hover over any file in home, photography, or storyboard
2. Click the **×** button that appears
3. Confirm deletion
4. **S3 Cleanup (Optional)**: If the file contains S3 images, you'll be asked if you want to delete them from S3 as well
5. The file and its folder (if applicable) are removed
6. **UNDO available**: Click the **"Undo"** button in the toast notification within 10 seconds to restore

**Safety Features:**
- Thumbs files (photography_thumbs.json, storyboard_thumbs.json) cannot be deleted
- All deletions show an **Undo button** for 10 seconds
- Last 10 deletions are kept in memory for undo
- File content is backed up before deletion
- S3 deletion is optional - you choose whether to clean up S3 images

### Managing Array Items

**For photography_thumbs.json and storyboard_thumbs.json:**

**Add New Item:**
1. Open the thumbs file
2. Click **"+ Add Item"** button at the top
3. A new item is added to the end
4. Expand it and fill in title and thumbUrl
5. Click **Save Changes**

**Delete Item:**
1. Find the item you want to remove
2. Expand its accordion
3. Click **Delete** button in the header
4. Confirm deletion
5. **S3 Cleanup (Optional)**: If the item contains S3 images, you'll be asked if you want to delete them from S3 as well
6. **UNDO available**: Click the **"Undo"** button in the toast notification within 10 seconds
7. Click **Save Changes** to persist

**Safety Features:**
- **Undo button** appears for 10 seconds after deletion
- Item is restored at its original position when undone
- Must save the file to make deletion permanent
- S3 deletion is optional - you choose whether to clean up S3 images

### Uploading Images

1. Click on any JSON file with image fields
2. Find the image field you want to update
3. Click the **"Upload New Image"** button
4. Select an image file from your computer
5. Watch the progress bar as it uploads
6. The URL field automatically updates with the new S3 URL
7. The preview refreshes to show the new image
8. Click **Save Changes** to persist the new URL

## Content Directory

The app manages files in the local `content/` directory within the project:

### File Structure

```
content/
├── home/
│   └── home1.json
├── photography/
│   ├── photography-1/ through photography-24/
│   └── photography_thumbs.json
├── storyboard/
│   ├── storyboard-1/, storyboard-2/
│   └── storyboard_thumbs.json
├── work/
│   └── mattePainting/
├── reel/
│   └── reel.json
```

**Note:** The `content/` directory is included in `.gitignore` to prevent committing large JSON and image files.

## Keyboard Shortcuts

- **Cmd/Ctrl + S**: Save current file

## Technical Details

- **Framework**: Electron
- **Security**: Context isolation enabled, Node integration disabled
- **IPC**: Secure communication between main and renderer processes via preload script

## Safety Features

- JSON validation before saving
- Error notifications for invalid operations
- Automatic backup recommendation (manual backups advised)
