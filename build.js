// Fix module resolution in packaged Electron app
const path = require('path');
const fs = require('fs');
const Module = require('module');

// Add asar node_modules to module search path globally if running in packaged app
if (process.versions.electron && !__dirname.includes('app.asar')) {
  // build.js is in Resources but node_modules is in app.asar
  const asarNodeModules = path.join(__dirname, 'app.asar', 'node_modules');

  // Add to current module's paths
  module.paths.unshift(asarNodeModules);

  // Modify global module resolution for all future requires
  const originalNodeModulePaths = Module._nodeModulePaths;
  Module._nodeModulePaths = function(from) {
    const paths = originalNodeModulePaths.call(this, from);
    // Add asar node_modules path to all module resolutions
    if (!paths.includes(asarNodeModules)) {
      paths.unshift(asarNodeModules);
    }
    return paths;
  };
}

require('@babel/register');
const React = require('react');
const { renderToString } = require('react-dom/server');
const HomePage = require('./src/home').HomePage;
const ReelPage = require('./src/pages/reel').ReelPage;
const { PhotographyListPage } = require('./src/pages/photography/photographyList');
const { PhotographyPage } = require('./src/pages/photography/photography');
const { StoryboardListPage } = require('./src/pages/storyboard/storyboardList');
const { StoryboardPage } = require('./src/pages/storyboard/storyboard');

function generatePhotographyPage(photos, currentPage, totalPages) {
  const listingHtml = renderToString(
    React.createElement(PhotographyListPage, {
      photos,
      currentPage,
      totalPages
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Photography - Page ${currentPage}</title>
        <link rel="stylesheet" href="../styles.css?v=${Date.now()}">
        <script>
          function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger-menu');
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
          }

          document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
              hamburger.addEventListener('click', toggleMobileMenu);
            }
          });
        </script>
      </head>
      <body>
        <div id="app">${listingHtml}</div>
      </body>
    </html>`;
}

function generateStoryboardPage(storyboards, currentPage, totalPages) {
  const listingHtml = renderToString(
    React.createElement(StoryboardListPage, {
      storyboards,
      currentPage,
      totalPages
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Storyboard - Page ${currentPage}</title>
        <link rel="stylesheet" href="../styles.css?v=${Date.now()}">
        <script>
          function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger-menu');
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
          }

          document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
              hamburger.addEventListener('click', toggleMobileMenu);
            }
          });
        </script>
      </head>
      <body>
        <div id="app">${listingHtml}</div>
      </body>
    </html>`;
}

async function buildSite() {
  const contentDir = path.join(__dirname, 'content/home');
  const distDir = path.join(__dirname, 'dist');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const homeImages = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8')));

  const homeHtml = renderToString(React.createElement(HomePage, { images: homeImages }));
  const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Aitor Maguregi - Digital Visual Artist</title>
        <link rel="stylesheet" href="styles.css">
        <script>
          function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger-menu');
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
          }

          document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
              hamburger.addEventListener('click', toggleMobileMenu);
            }
          });
        </script>
        <style>
          .gallery-image {
            display: none;
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .gallery-image.active {
            display: block;
          }
          .image-title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 2.5rem;
            text-align: center;
            z-index: 10;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          .image-title.active {
            opacity: 1;
          }
        </style>
      </head>
      <body>
        <div id="app">${homeHtml}</div>
        <script>
          window.images = ${JSON.stringify(homeImages)};
          window.currentImage = 0;
          
          window.changeImage = function(direction) {
            if (!window.images || !window.images.length) return;
            
            // Hide current image and title
            document.querySelector('.gallery-image.active').classList.remove('active');
            document.querySelector('.image-title.active').classList.remove('active');
            
            // Calculate new index
            window.currentImage = (window.currentImage + direction + window.images.length) % window.images.length;
            
            // Show new image and title
            document.querySelectorAll('.gallery-image')[window.currentImage].classList.add('active');
            document.querySelectorAll('.image-title')[window.currentImage].classList.add('active');
          }
          
          // Add click event listeners
          document.querySelector('.nav-arrow.left').addEventListener('click', () => window.changeImage(-1));
          document.querySelector('.nav-arrow.right').addEventListener('click', () => window.changeImage(1));
        </script>
      </body>
    </html>`;

  fs.writeFileSync(path.join(distDir, 'index.html'), html);
  fs.copyFileSync(path.join(__dirname, 'website-styles.css'), path.join(distDir, 'styles.css'));

  // Build reel page
  const reelContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/reel/reel.json'), 'utf8'));
  const reelHtml = renderToString(React.createElement(ReelPage, { reel: reelContent }));
  const reelPageHtml = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Reel - Aitor Maguregi</title>
        <link rel="stylesheet" href="styles.css">
        <script>
          function toggleMobileMenu() {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger-menu');
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
          }

          document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger-menu');
            if (hamburger) {
              hamburger.addEventListener('click', toggleMobileMenu);
            }
          });
        </script>
      </head>
      <body>
        <div id="app">${reelHtml}</div>
      </body>
    </html>`;
  
  fs.writeFileSync(path.join(distDir, 'reel.html'), reelPageHtml);

  // Build photography list pages
  const photographyDir = path.join(distDir, 'photography');
  if (!fs.existsSync(photographyDir)) {
    fs.mkdirSync(photographyDir, { recursive: true });
  }

  const photographyThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/photography/photography_thumbs.json'), 'utf8')
  );

  const ITEMS_PER_PAGE = 8;
  const photoTotalPages = Math.ceil(photographyThumbs.length / ITEMS_PER_PAGE);

  for (let page = 1; page <= photoTotalPages; page++) {
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const pagePhotos = photographyThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(photographyDir, `photography-list-${page}.html`),
      generatePhotographyPage(pagePhotos, page, photoTotalPages)
    );
  }

  // Build individual photography detail pages
  const photographyPagesDir = path.join(photographyDir, 'pages');
  if (!fs.existsSync(photographyPagesDir)) {
    fs.mkdirSync(photographyPagesDir, { recursive: true });
  }

  const photographyContentDir = path.join(__dirname, 'content/photography');
  const photographyFolders = fs.readdirSync(photographyContentDir)
    .filter(item => fs.statSync(path.join(photographyContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('photography-'));

  const photographyDetails = photographyFolders.map(folder => {
    const folderPath = path.join(photographyContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const photoNumber = folder.replace('photography-', '');
      return { content, photoNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const photo of photographyDetails) {
    const html = renderToString(React.createElement(PhotographyPage, { content: photo.content }));
    const fileName = `${photo.content.title.replace(/[^a-zA-Z0-9]/g, '-')}-${photo.photoNumber}.html`;

    fs.writeFileSync(
      path.join(photographyPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${photo.content.title}</title>
            <link rel="stylesheet" href="../../styles.css?v=${Date.now()}">
            <script>
              function toggleMobileMenu() {
                const navLinks = document.getElementById('navLinks');
                const hamburger = document.querySelector('.hamburger-menu');
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
              }

              document.addEventListener('DOMContentLoaded', function() {
                const hamburger = document.querySelector('.hamburger-menu');
                if (hamburger) {
                  hamburger.addEventListener('click', toggleMobileMenu);
                }
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }

  // Build storyboard list pages
  const storyboardDir = path.join(distDir, 'storyboard');
  if (!fs.existsSync(storyboardDir)) {
    fs.mkdirSync(storyboardDir, { recursive: true });
  }

  const storyboardThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/storyboard/storyboard_thumbs.json'), 'utf8')
  );

  const STORYBOARD_ITEMS_PER_PAGE = 8;
  const storyboardTotalPages = Math.ceil(storyboardThumbs.length / STORYBOARD_ITEMS_PER_PAGE);

  for (let page = 1; page <= storyboardTotalPages; page++) {
    const startIdx = (page - 1) * STORYBOARD_ITEMS_PER_PAGE;
    const endIdx = startIdx + STORYBOARD_ITEMS_PER_PAGE;
    const pageStoryboards = storyboardThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(storyboardDir, `storyboard-list-${page}.html`),
      generateStoryboardPage(pageStoryboards, page, storyboardTotalPages)
    );
  }

  // Build individual storyboard detail pages
  const storyboardPagesDir = path.join(storyboardDir, 'pages');
  if (!fs.existsSync(storyboardPagesDir)) {
    fs.mkdirSync(storyboardPagesDir, { recursive: true });
  }

  const storyboardContentDir = path.join(__dirname, 'content/storyboard');
  const storyboardFolders = fs.readdirSync(storyboardContentDir)
    .filter(item => fs.statSync(path.join(storyboardContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('storyboard-'));

  const storyboardDetails = storyboardFolders.map(folder => {
    const folderPath = path.join(storyboardContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const storyboardNumber = folder.replace('storyboard-', '');
      return { content, storyboardNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const storyboard of storyboardDetails) {
    const html = renderToString(React.createElement(StoryboardPage, { content: storyboard.content }));
    const fileName = `${storyboard.content.title.replace(/[^a-zA-Z0-9]/g, '-')}-${storyboard.storyboardNumber}.html`;

    fs.writeFileSync(
      path.join(storyboardPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${storyboard.content.title}</title>
            <link rel="stylesheet" href="../../styles.css?v=${Date.now()}">
            <script>
              function toggleMobileMenu() {
                const navLinks = document.getElementById('navLinks');
                const hamburger = document.querySelector('.hamburger-menu');
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
              }

              document.addEventListener('DOMContentLoaded', function() {
                const hamburger = document.querySelector('.hamburger-menu');
                if (hamburger) {
                  hamburger.addEventListener('click', toggleMobileMenu);
                }
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }
}

// Export for use as module or run directly
if (require.main === module) {
  // Called directly with `node build.js`
  buildSite().catch(console.error);
} else {
  // Imported as module
  module.exports = buildSite;
}