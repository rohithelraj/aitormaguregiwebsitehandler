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

// Clear require cache for src files to ensure fresh builds
Object.keys(require.cache).forEach(key => {
  if (key.includes('/src/')) {
    delete require.cache[key];
  }
});

const React = require('react');
const { renderToString } = require('react-dom/server');
const HomePage = require('./src/home').HomePage;
const ReelPage = require('./src/pages/reel').ReelPage;
const { AboutPage } = require('./src/pages/about');
const { PhotographyListPage } = require('./src/pages/photography/photographyList');
const { PhotographyPage } = require('./src/pages/photography/photography');
const { StoryboardListPage } = require('./src/pages/storyboard/storyboardList');
const { StoryboardPage } = require('./src/pages/storyboard/storyboard');
const { MattePaintingListPage } = require('./src/pages/mattePainting/mattePaintingList');
const { MattePaintingPage } = require('./src/pages/mattePainting/mattePainting');
const { ConceptArtListPage } = require('./src/pages/conceptArt/conceptArtList');
const { ConceptArtPage } = require('./src/pages/conceptArt/conceptArt');
const { KeyframeListPage } = require('./src/pages/keyframe/keyframeList');
const { KeyframePage } = require('./src/pages/keyframe/keyframe');
const { ColorStudyListPage } = require('./src/pages/colorStudy/colorStudyList');
const { ColorStudyPage } = require('./src/pages/colorStudy/colorStudy');
const { SketchListPage } = require('./src/pages/sketch/sketchList');
const { SketchPage } = require('./src/pages/sketch/sketch');

function generatePhotographyPage(photos, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(PhotographyListPage, {
      photos,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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

function generateStoryboardPage(storyboards, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(StoryboardListPage, {
      storyboards,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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

function generateMattePaintingPage(mattePaintings, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(MattePaintingListPage, {
      mattePaintings,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Matte Painting - Page ${currentPage}</title>
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

function generateConceptArtPage(conceptArts, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(ConceptArtListPage, {
      conceptArts,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Concept Art - Page ${currentPage}</title>
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

function generateKeyframePage(keyframes, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(KeyframeListPage, {
      keyframes,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Keyframe - Page ${currentPage}</title>
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

function generateColorStudyPage(colorStudies, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(ColorStudyListPage, {
      colorStudies,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Color Study - Page ${currentPage}</title>
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

function generateSketchPage(sketches, currentPage, totalPages, footerData) {
  const listingHtml = renderToString(
    React.createElement(SketchListPage, {
      sketches,
      currentPage,
      totalPages,
      footerData
    })
  );

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="0">
        <title>Sketch - Page ${currentPage}</title>
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
  const distDir = path.join(__dirname, 'dist', 'website');

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Load footer configuration
  const footerPath = path.join(__dirname, 'content/footer/footer.json');
  let footerData = null;
  if (fs.existsSync(footerPath)) {
    footerData = JSON.parse(fs.readFileSync(footerPath, 'utf8'));
  }

  const homeImages = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .map(file => JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8')));

  const homeHtml = renderToString(React.createElement(HomePage, { images: homeImages, footerData: footerData }));
  const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Aitor Maguregi - Digital Visual Artist</title>
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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

  // Copy icons directory if it exists
  const iconsSourceDir = path.join(__dirname, 'icons');
  const iconsDistDir = path.join(distDir, 'icons');
  if (fs.existsSync(iconsSourceDir)) {
    if (!fs.existsSync(iconsDistDir)) {
      fs.mkdirSync(iconsDistDir, { recursive: true });
    }
    const iconFiles = fs.readdirSync(iconsSourceDir);
    iconFiles.forEach(file => {
      fs.copyFileSync(path.join(iconsSourceDir, file), path.join(iconsDistDir, file));
    });
  }

  // Build reel page
  const reelContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/reel/reel.json'), 'utf8'));
  const reelHtml = renderToString(React.createElement(ReelPage, { reel: reelContent, footerData: footerData }));
  const reelPageHtml = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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

  // Build about page
  const aboutContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'content/about/about.json'), 'utf8'));
  const aboutHtml = renderToString(React.createElement(AboutPage, { about: aboutContent, footerData: footerData }));
  const aboutPageHtml = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
        <title>About - Aitor Maguregi</title>
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
        <div id="app">${aboutHtml}</div>
      </body>
    </html>`;

  fs.writeFileSync(path.join(distDir, 'about.html'), aboutPageHtml);

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
      generatePhotographyPage(pagePhotos, page, photoTotalPages, footerData)
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
    const html = renderToString(React.createElement(PhotographyPage, { content: photo.content, footerData: footerData }));
    const fileName = `${photo.content.title.replace(/[^a-zA-Z0-9]/g, '-')}-${photo.photoNumber}.html`;

    fs.writeFileSync(
      path.join(photographyPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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
      generateStoryboardPage(pageStoryboards, page, storyboardTotalPages, footerData)
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
    const html = renderToString(React.createElement(StoryboardPage, { content: storyboard.content, footerData: footerData }));
    const fileName = `${storyboard.content.title.replace(/[^a-zA-Z0-9]/g, '-')}-${storyboard.storyboardNumber}.html`;

    fs.writeFileSync(
      path.join(storyboardPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
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

  // Build matte painting list pages
  const mattePaintingDir = path.join(distDir, 'mattePainting');
  if (!fs.existsSync(mattePaintingDir)) {
    fs.mkdirSync(mattePaintingDir, { recursive: true });
  }

  const mattePaintingThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/mattePainting/mattePainting_thumbs.json'), 'utf8')
  );

  const MATTEPAINTING_ITEMS_PER_PAGE = 6;
  const mattePaintingTotalPages = Math.ceil(mattePaintingThumbs.length / MATTEPAINTING_ITEMS_PER_PAGE);

  for (let page = 1; page <= mattePaintingTotalPages; page++) {
    const startIdx = (page - 1) * MATTEPAINTING_ITEMS_PER_PAGE;
    const endIdx = startIdx + MATTEPAINTING_ITEMS_PER_PAGE;
    const pageMattePaintings = mattePaintingThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(mattePaintingDir, `mattePainting-list-${page}.html`),
      generateMattePaintingPage(pageMattePaintings, page, mattePaintingTotalPages, footerData)
    );
  }

  // Build individual matte painting detail pages
  const mattePaintingPagesDir = path.join(mattePaintingDir, 'pages');
  if (!fs.existsSync(mattePaintingPagesDir)) {
    fs.mkdirSync(mattePaintingPagesDir, { recursive: true });
  }

  const mattePaintingContentDir = path.join(__dirname, 'content/mattePainting');
  const mattePaintingFolders = fs.readdirSync(mattePaintingContentDir)
    .filter(item => fs.statSync(path.join(mattePaintingContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('mattePainting-'));

  const mattePaintingDetails = mattePaintingFolders.map(folder => {
    const folderPath = path.join(mattePaintingContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const mattePaintingNumber = folder.replace('mattePainting-', '');
      return { content, mattePaintingNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const mattePainting of mattePaintingDetails) {
    const html = renderToString(React.createElement(MattePaintingPage, { content: mattePainting.content, footerData: footerData }));
    const title = mattePainting.content.tilte || mattePainting.content.title || 'Matte Painting';
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '-')}-${mattePainting.mattePaintingNumber}.html`;

    fs.writeFileSync(
      path.join(mattePaintingPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${title}</title>
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

                // Image toggle functionality
                const imageToggle = document.getElementById('imageToggle');
                const mainImage = document.getElementById('mainImage');

                if (imageToggle && mainImage) {
                  const mainImageSrc = mainImage.getAttribute('data-main-image');
                  const toggleImageSrc = mainImage.getAttribute('data-toggle-image');

                  if (toggleImageSrc) {
                    imageToggle.addEventListener('change', function() {
                      if (this.checked) {
                        mainImage.src = toggleImageSrc;
                      } else {
                        mainImage.src = mainImageSrc;
                      }
                    });
                  }
                }

                // Modal functionality for sub-images
                const modal = document.getElementById('imageModal');
                const modalImage = document.getElementById('modalImage');
                const modalCaption = document.getElementById('modalCaption');
                const closeModal = document.querySelector('.modal-close');
                const clickableImages = document.querySelectorAll('.clickable-image');

                // Open modal when clicking on sub-images
                clickableImages.forEach(function(img) {
                  img.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = this.getAttribute('data-image-url');
                    modalCaption.textContent = this.getAttribute('data-image-name');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                  });
                });

                // Close modal when clicking X
                if (closeModal) {
                  closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  });
                }

                // Close modal when clicking outside the image
                if (modal) {
                  modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                      modal.style.display = 'none';
                      document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                  });
                }

                // Close modal on ESC key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  }
                });
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }

  // Build concept art list pages
  const conceptArtDir = path.join(distDir, 'conceptArt');
  if (!fs.existsSync(conceptArtDir)) {
    fs.mkdirSync(conceptArtDir, { recursive: true });
  }

  const conceptArtThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/conceptArt/conceptArt_thumbs.json'), 'utf8')
  );

  const CONCEPTART_ITEMS_PER_PAGE = 6;
  const conceptArtTotalPages = Math.ceil(conceptArtThumbs.length / CONCEPTART_ITEMS_PER_PAGE);

  for (let page = 1; page <= conceptArtTotalPages; page++) {
    const startIdx = (page - 1) * CONCEPTART_ITEMS_PER_PAGE;
    const endIdx = startIdx + CONCEPTART_ITEMS_PER_PAGE;
    const pageConceptArts = conceptArtThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(conceptArtDir, `conceptArt-list-${page}.html`),
      generateConceptArtPage(pageConceptArts, page, conceptArtTotalPages, footerData)
    );
  }

  // Build individual concept art detail pages
  const conceptArtPagesDir = path.join(conceptArtDir, 'pages');
  if (!fs.existsSync(conceptArtPagesDir)) {
    fs.mkdirSync(conceptArtPagesDir, { recursive: true });
  }

  const conceptArtContentDir = path.join(__dirname, 'content/conceptArt');
  const conceptArtFolders = fs.readdirSync(conceptArtContentDir)
    .filter(item => fs.statSync(path.join(conceptArtContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('conceptArt-'));

  const conceptArtDetails = conceptArtFolders.map(folder => {
    const folderPath = path.join(conceptArtContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const conceptArtNumber = folder.replace('conceptArt-', '');
      return { content, conceptArtNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const conceptArt of conceptArtDetails) {
    const html = renderToString(React.createElement(ConceptArtPage, { content: conceptArt.content, footerData: footerData }));
    const title = conceptArt.content.tilte || conceptArt.content.title || 'Concept Art';
    const fileName = `Concept-Art-Example-${conceptArt.conceptArtNumber}.html`;

    fs.writeFileSync(
      path.join(conceptArtPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${title}</title>
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

                // Image toggle functionality
                const imageToggle = document.getElementById('imageToggle');
                const mainImage = document.getElementById('mainImage');

                if (imageToggle && mainImage) {
                  const mainImageSrc = mainImage.getAttribute('data-main-image');
                  const toggleImageSrc = mainImage.getAttribute('data-toggle-image');

                  if (toggleImageSrc) {
                    imageToggle.addEventListener('change', function() {
                      if (this.checked) {
                        mainImage.src = toggleImageSrc;
                      } else {
                        mainImage.src = mainImageSrc;
                      }
                    });
                  }
                }

                // Modal functionality for sub-images
                const modal = document.getElementById('imageModal');
                const modalImage = document.getElementById('modalImage');
                const modalCaption = document.getElementById('modalCaption');
                const closeModal = document.querySelector('.modal-close');
                const clickableImages = document.querySelectorAll('.clickable-image');

                // Open modal when clicking on sub-images
                clickableImages.forEach(function(img) {
                  img.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = this.getAttribute('data-image-url');
                    modalCaption.textContent = this.getAttribute('data-image-name');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                  });
                });

                // Close modal when clicking X
                if (closeModal) {
                  closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  });
                }

                // Close modal when clicking outside the image
                if (modal) {
                  modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                      modal.style.display = 'none';
                      document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                  });
                }

                // Close modal on ESC key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  }
                });
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }

  // Build keyframe list pages
  const keyframeDir = path.join(distDir, 'keyframe');
  if (!fs.existsSync(keyframeDir)) {
    fs.mkdirSync(keyframeDir, { recursive: true });
  }

  const keyframeThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/keyframe/keyframe_thumbs.json'), 'utf8')
  );

  const KEYFRAME_ITEMS_PER_PAGE = 6;
  const keyframeTotalPages = Math.ceil(keyframeThumbs.length / KEYFRAME_ITEMS_PER_PAGE);

  for (let page = 1; page <= keyframeTotalPages; page++) {
    const startIdx = (page - 1) * KEYFRAME_ITEMS_PER_PAGE;
    const endIdx = startIdx + KEYFRAME_ITEMS_PER_PAGE;
    const pageKeyframes = keyframeThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(keyframeDir, `keyframe-list-${page}.html`),
      generateKeyframePage(pageKeyframes, page, keyframeTotalPages, footerData)
    );
  }

  // Build individual keyframe detail pages
  const keyframePagesDir = path.join(keyframeDir, 'pages');
  if (!fs.existsSync(keyframePagesDir)) {
    fs.mkdirSync(keyframePagesDir, { recursive: true });
  }

  const keyframeContentDir = path.join(__dirname, 'content/keyframe');
  const keyframeFolders = fs.readdirSync(keyframeContentDir)
    .filter(item => fs.statSync(path.join(keyframeContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('keyframe-'));

  const keyframeDetails = keyframeFolders.map(folder => {
    const folderPath = path.join(keyframeContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const keyframeNumber = folder.replace('keyframe-', '');
      return { content, keyframeNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const keyframe of keyframeDetails) {
    const html = renderToString(React.createElement(KeyframePage, { content: keyframe.content, footerData: footerData }));
    const title = keyframe.content.tilte || keyframe.content.title || 'Keyframe';
    const fileName = `Keyframe-Example-${keyframe.keyframeNumber}.html`;

    fs.writeFileSync(
      path.join(keyframePagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${title}</title>
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

                // Image toggle functionality
                const imageToggle = document.getElementById('imageToggle');
                const mainImage = document.getElementById('mainImage');

                if (imageToggle && mainImage) {
                  const mainImageSrc = mainImage.getAttribute('data-main-image');
                  const toggleImageSrc = mainImage.getAttribute('data-toggle-image');

                  if (toggleImageSrc) {
                    imageToggle.addEventListener('change', function() {
                      if (this.checked) {
                        mainImage.src = toggleImageSrc;
                      } else {
                        mainImage.src = mainImageSrc;
                      }
                    });
                  }
                }

                // Modal functionality for sub-images
                const modal = document.getElementById('imageModal');
                const modalImage = document.getElementById('modalImage');
                const modalCaption = document.getElementById('modalCaption');
                const closeModal = document.querySelector('.modal-close');
                const clickableImages = document.querySelectorAll('.clickable-image');

                // Open modal when clicking on sub-images
                clickableImages.forEach(function(img) {
                  img.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = this.getAttribute('data-image-url');
                    modalCaption.textContent = this.getAttribute('data-image-name');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                  });
                });

                // Close modal when clicking X
                if (closeModal) {
                  closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  });
                }

                // Close modal when clicking outside the image
                if (modal) {
                  modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                      modal.style.display = 'none';
                      document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                  });
                }

                // Close modal on ESC key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  }
                });
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }

  // Build color study list pages
  const colorStudyDir = path.join(distDir, 'colorStudy');
  if (!fs.existsSync(colorStudyDir)) {
    fs.mkdirSync(colorStudyDir, { recursive: true });
  }

  const colorStudyThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/colorStudy/colorStudy_thumbs.json'), 'utf8')
  );

  const COLORSTUDY_ITEMS_PER_PAGE = 6;
  const colorStudyTotalPages = Math.ceil(colorStudyThumbs.length / COLORSTUDY_ITEMS_PER_PAGE);

  for (let page = 1; page <= colorStudyTotalPages; page++) {
    const startIdx = (page - 1) * COLORSTUDY_ITEMS_PER_PAGE;
    const endIdx = startIdx + COLORSTUDY_ITEMS_PER_PAGE;
    const pageColorStudies = colorStudyThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(colorStudyDir, `colorStudy-list-${page}.html`),
      generateColorStudyPage(pageColorStudies, page, colorStudyTotalPages, footerData)
    );
  }

  // Build individual color study detail pages
  const colorStudyPagesDir = path.join(colorStudyDir, 'pages');
  if (!fs.existsSync(colorStudyPagesDir)) {
    fs.mkdirSync(colorStudyPagesDir, { recursive: true });
  }

  const colorStudyContentDir = path.join(__dirname, 'content/colorStudy');
  const colorStudyFolders = fs.readdirSync(colorStudyContentDir)
    .filter(item => fs.statSync(path.join(colorStudyContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('colorStudy-'));

  const colorStudyDetails = colorStudyFolders.map(folder => {
    const folderPath = path.join(colorStudyContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const colorStudyNumber = folder.replace('colorStudy-', '');
      return { content, colorStudyNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const colorStudy of colorStudyDetails) {
    const html = renderToString(React.createElement(ColorStudyPage, { content: colorStudy.content, footerData: footerData }));
    const title = colorStudy.content.tilte || colorStudy.content.title || 'Color Study';
    const fileName = `Color-Study-Example-${colorStudy.colorStudyNumber}.html`;

    fs.writeFileSync(
      path.join(colorStudyPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${title}</title>
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

                // Image toggle functionality
                const imageToggle = document.getElementById('imageToggle');
                const mainImage = document.getElementById('mainImage');

                if (imageToggle && mainImage) {
                  const mainImageSrc = mainImage.getAttribute('data-main-image');
                  const toggleImageSrc = mainImage.getAttribute('data-toggle-image');

                  if (toggleImageSrc) {
                    imageToggle.addEventListener('change', function() {
                      if (this.checked) {
                        mainImage.src = toggleImageSrc;
                      } else {
                        mainImage.src = mainImageSrc;
                      }
                    });
                  }
                }

                // Modal functionality for sub-images
                const modal = document.getElementById('imageModal');
                const modalImage = document.getElementById('modalImage');
                const modalCaption = document.getElementById('modalCaption');
                const closeModal = document.querySelector('.modal-close');
                const clickableImages = document.querySelectorAll('.clickable-image');

                // Open modal when clicking on sub-images
                clickableImages.forEach(function(img) {
                  img.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = this.getAttribute('data-image-url');
                    modalCaption.textContent = this.getAttribute('data-image-name');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                  });
                });

                // Close modal when clicking X
                if (closeModal) {
                  closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  });
                }

                // Close modal when clicking outside the image
                if (modal) {
                  modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                      modal.style.display = 'none';
                      document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                  });
                }

                // Close modal on ESC key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  }
                });
              });
            </script>
          </head>
          <body>
            <div id="app">${html}</div>
          </body>
        </html>`
    );
  }

  // Build sketch list pages
  const sketchDir = path.join(distDir, 'sketch');
  if (!fs.existsSync(sketchDir)) {
    fs.mkdirSync(sketchDir, { recursive: true });
  }

  const sketchThumbs = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'content/sketch/sketch_thumbs.json'), 'utf8')
  );

  const SKETCH_ITEMS_PER_PAGE = 6;
  const sketchTotalPages = Math.ceil(sketchThumbs.length / SKETCH_ITEMS_PER_PAGE);

  for (let page = 1; page <= sketchTotalPages; page++) {
    const startIdx = (page - 1) * SKETCH_ITEMS_PER_PAGE;
    const endIdx = startIdx + SKETCH_ITEMS_PER_PAGE;
    const pageSketches = sketchThumbs.slice(startIdx, endIdx);

    fs.writeFileSync(
      path.join(sketchDir, `sketch-list-${page}.html`),
      generateSketchPage(pageSketches, page, sketchTotalPages, footerData)
    );
  }

  // Build individual sketch detail pages
  const sketchPagesDir = path.join(sketchDir, 'pages');
  if (!fs.existsSync(sketchPagesDir)) {
    fs.mkdirSync(sketchPagesDir, { recursive: true });
  }

  const sketchContentDir = path.join(__dirname, 'content/sketch');
  const sketchFolders = fs.readdirSync(sketchContentDir)
    .filter(item => fs.statSync(path.join(sketchContentDir, item)).isDirectory())
    .filter(folder => folder.startsWith('sketch-'));

  const sketchDetails = sketchFolders.map(folder => {
    const folderPath = path.join(sketchContentDir, folder);
    const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      const content = JSON.parse(fs.readFileSync(path.join(folderPath, jsonFile), 'utf8'));
      const sketchNumber = folder.replace('sketch-', '');
      return { content, sketchNumber };
    }
    return null;
  }).filter(item => item !== null);

  for (const sketch of sketchDetails) {
    const html = renderToString(React.createElement(SketchPage, { content: sketch.content, footerData: footerData }));
    const title = sketch.content.tilte || sketch.content.title || 'Sketch';
    const fileName = `Sketch-Example-${sketch.sketchNumber}.html`;

    fs.writeFileSync(
      path.join(sketchPagesDir, fileName),
      `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="icon" type="image/x-icon" href="/icons/favicon.ico">
            <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
            <meta http-equiv="Pragma" content="no-cache">
            <meta http-equiv="Expires" content="0">
            <title>${title}</title>
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

                // Image toggle functionality
                const imageToggle = document.getElementById('imageToggle');
                const mainImage = document.getElementById('mainImage');

                if (imageToggle && mainImage) {
                  const mainImageSrc = mainImage.getAttribute('data-main-image');
                  const toggleImageSrc = mainImage.getAttribute('data-toggle-image');

                  if (toggleImageSrc) {
                    imageToggle.addEventListener('change', function() {
                      if (this.checked) {
                        mainImage.src = toggleImageSrc;
                      } else {
                        mainImage.src = mainImageSrc;
                      }
                    });
                  }
                }

                // Modal functionality for sub-images
                const modal = document.getElementById('imageModal');
                const modalImage = document.getElementById('modalImage');
                const modalCaption = document.getElementById('modalCaption');
                const closeModal = document.querySelector('.modal-close');
                const clickableImages = document.querySelectorAll('.clickable-image');

                // Open modal when clicking on sub-images
                clickableImages.forEach(function(img) {
                  img.addEventListener('click', function() {
                    modal.style.display = 'flex';
                    modalImage.src = this.getAttribute('data-image-url');
                    modalCaption.textContent = this.getAttribute('data-image-name');
                    document.body.style.overflow = 'hidden'; // Prevent scrolling
                  });
                });

                // Close modal when clicking X
                if (closeModal) {
                  closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  });
                }

                // Close modal when clicking outside the image
                if (modal) {
                  modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                      modal.style.display = 'none';
                      document.body.style.overflow = 'auto'; // Re-enable scrolling
                    }
                  });
                }

                // Close modal on ESC key
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'Escape' && modal.style.display === 'flex') {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Re-enable scrolling
                  }
                });
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