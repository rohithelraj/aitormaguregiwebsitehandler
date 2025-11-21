# Building Aitor Content Manager

This guide explains how to build the Aitor Content Manager into distributable executable files for Windows, macOS, and Linux.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- All dependencies installed (`npm install`)

## Platform Requirements

### Building for Windows
- Can be built on: Windows, macOS, Linux
- Requires: `build/icon.ico` (256x256 icon file)

### Building for macOS
- Can be built on: macOS only (due to code signing requirements)
- Requires: `build/icon.icns` (512x512 icon file)

### Building for Linux
- Can be built on: Linux, macOS, Windows
- Requires: `build/icon.png` (512x512 icon file)

## Icon Files

Place your application icons in the `build/` directory:

```
build/
├── icon.ico   (Windows)
├── icon.icns  (macOS)
└── icon.png   (Linux)
```

**Note:** If you don't have icons yet, electron-builder will use default icons, but it's recommended to create custom ones for a professional look.

### Creating Icons

You can use online tools or command-line utilities to convert images to the required formats:
- **PNG to ICO**: Use [icoconvert.com](https://icoconvert.com/) or ImageMagick
- **PNG to ICNS**: Use [cloudconvert.com](https://cloudconvert.com/) or `iconutil` on macOS
- **Base Image**: Start with a 1024x1024 PNG with transparent background

## Build Commands

### Build for All Platforms

```bash
npm run build
```

This will attempt to build for your current platform.

### Build for Specific Platforms

**Windows:**
```bash
npm run build:win
```
Outputs:
- `dist/Aitor Content Manager Setup X.X.X.exe` (NSIS installer)
- `dist/Aitor Content Manager X.X.X.exe` (portable executable)

**macOS:**
```bash
npm run build:mac
```
Outputs:
- `dist/Aitor Content Manager-X.X.X.dmg` (disk image)
- `dist/Aitor Content Manager-X.X.X-mac.zip` (ZIP archive)

**Linux:**
```bash
npm run build:linux
```
Outputs:
- `dist/Aitor Content Manager-X.X.X.AppImage` (universal Linux package)
- `dist/aitor-content-manager_X.X.X_amd64.deb` (Debian package)

## Build Output

All built files are placed in the `dist/` directory, which is excluded from git via `.gitignore`.

## First-Time Build

Before building for the first time:

1. **Ensure all dependencies are installed:**
   ```bash
   npm install
   ```

2. **Create icon files** (optional but recommended):
   - Add `icon.ico`, `icon.icns`, and `icon.png` to the `build/` directory

3. **Run the build command** for your target platform:
   ```bash
   npm run build:win   # For Windows
   npm run build:mac   # For macOS
   npm run build:linux # For Linux
   ```

4. **Wait for the build to complete**:
   - First build may take several minutes
   - electron-builder will download platform-specific dependencies
   - Subsequent builds will be faster

## Testing Built Applications

### Windows
1. Navigate to `dist/`
2. Run the portable `.exe` file directly, or
3. Run the `Setup.exe` installer and install the app

### macOS
1. Navigate to `dist/`
2. Open the `.dmg` file
3. Drag the app to Applications folder
4. Launch from Applications

### Linux
1. Navigate to `dist/`
2. For AppImage: `chmod +x *.AppImage && ./Aitor\ Content\ Manager-*.AppImage`
3. For Debian: `sudo dpkg -i aitor-content-manager_*.deb`

## Important Notes

### Content Directory

The `content/` directory is included in the build and packaged with the application. The built app will:
- Create a `content/` directory in the app's installation folder
- Use this directory to read and write JSON files
- Preserve the existing content structure

### S3 Configuration

The `s3-config.json` file is also included in the build. Make sure:
- Your credentials are set before building
- The file exists in the project root
- You understand that these credentials will be embedded in the app

**Security Note:** For production distribution, consider using environment variables or a secure credential management system instead of embedding credentials in the build.

### Code Signing

For distribution outside your organization:

- **macOS**: Requires Apple Developer account and code signing certificate
- **Windows**: Requires code signing certificate for SmartScreen reputation
- **Linux**: Generally doesn't require code signing

Without code signing:
- macOS will show "unidentified developer" warning
- Windows SmartScreen may show warnings
- Users can still run the app by bypassing these warnings

## Troubleshooting

### Build fails with "icon not found"
- Create the `build/` directory if it doesn't exist
- Add at least one icon file or remove icon references from `package.json`

### Build fails on macOS for Windows target
- This is expected - Windows builds require Windows-specific tools
- Use a Windows VM or CI service to build for Windows

### "Cannot find module" errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules/` and run `npm install` again

### Out of memory errors
- Close other applications
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

## Distribution

Once built, you can distribute the files from the `dist/` directory:

- **Windows NSIS installer**: Recommended for end users, handles installation/uninstallation
- **Windows portable**: No installation required, runs directly
- **macOS DMG**: Standard macOS distribution format
- **Linux AppImage**: Universal, runs on most Linux distributions
- **Linux deb**: For Debian/Ubuntu users

## Clean Build

To perform a clean build:

```bash
# Remove previous build artifacts
rm -rf dist/

# Remove electron-builder cache
rm -rf .cache/

# Rebuild
npm run build
```

## Automatic Updates

The current configuration doesn't include automatic updates. To add this feature:
1. Set up a release server
2. Configure `publish` settings in `package.json`
3. Integrate `electron-updater` in the app

See [electron-builder documentation](https://www.electron.build/configuration/publish) for details.
