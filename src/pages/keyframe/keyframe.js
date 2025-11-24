const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');

const KeyframePage = ({ content, footerData }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Keyframe', link: '/keyframe/keyframe-list-1.html' },
    { label: content.tilte || content.title }
  ];

  const hasToggle = content.mainImage && content.mainImageToggle && content.mainImageToggle !== content.mainImage;

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    // Check if it's already an embed URL
    if (url.includes('/embed/')) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }

    // Format: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // If we found a video ID, return embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Not a YouTube URL, return original (for mp4 files, etc.)
    return url;
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'keyframe-detail-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'keyframe-detail' },
        // Title
        (content.tilte || content.title) && React.createElement('h1', { className: 'detail-title' }, content.tilte || content.title),

        // Toggle button (if mainImageToggle exists)
        hasToggle && React.createElement('div', { className: 'image-toggle-container' },
          React.createElement('label', { className: 'toggle-label' },
            React.createElement('input', {
              type: 'checkbox',
              id: 'imageToggle',
              className: 'toggle-checkbox'
            }),
            React.createElement('span', { className: 'toggle-text' }, 'Toggle')
          )
        ),

        // Main image section
        content.mainImage && React.createElement('div', { className: 'detail-image-section' },
          React.createElement('img', {
            id: 'mainImage',
            src: content.mainImage,
            'data-main-image': content.mainImage,
            'data-toggle-image': content.mainImageToggle || '',
            alt: content.mainImageName || content.tilte || content.title,
            className: 'detail-image'
          }),
          content.mainImageName && React.createElement('p', { className: 'image-caption' }, content.mainImageName)
        ),

        // Description
        content.Description && React.createElement('div', { className: 'detail-text-section' },
          React.createElement('p', { className: 'detail-description' }, content.Description)
        ),

        // Sub images
        content.subImages && content.subImages.length > 0 && React.createElement('div', { className: 'sub-images-section' },
          React.createElement('h2', { className: 'sub-images-title' }, 'Variations'),
          React.createElement('div', { className: 'sub-images-grid' },
            content.subImages.map((subImage, index) =>
              React.createElement('div', { className: 'sub-image-item', key: index },
                React.createElement('img', {
                  src: subImage.image,
                  alt: subImage.name || `Variation ${index + 1}`,
                  className: 'sub-image clickable-image',
                  'data-image-url': subImage.image,
                  'data-image-name': subImage.name || `Variation ${index + 1}`
                }),
                subImage.name && React.createElement('h3', { className: 'sub-image-name' }, subImage.name),
                subImage.description && React.createElement('p', { className: 'sub-image-description' }, subImage.description)
              )
            )
          )
        ),

        // Modal for sub-images
        React.createElement('div', { id: 'imageModal', className: 'image-modal' },
          React.createElement('span', { className: 'modal-close' }, '�'),
          React.createElement('div', { className: 'modal-content-wrapper' },
            React.createElement('img', { id: 'modalImage', className: 'modal-image', src: '', alt: '' }),
            React.createElement('div', { id: 'modalCaption', className: 'modal-caption' })
          )
        ),

        // Video section
        content.videoUrl && React.createElement('div', { className: 'video-section' },
          React.createElement('h2', { className: 'video-title' }, 'Video'),
          isYouTubeUrl(content.videoUrl)
            ? React.createElement('div', { className: 'video-wrapper' },
                React.createElement('iframe', {
                  src: getYouTubeEmbedUrl(content.videoUrl),
                  className: 'detail-video youtube-video',
                  frameBorder: '0',
                  allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                  allowFullScreen: true
                })
              )
            : React.createElement('video', {
                controls: true,
                className: 'detail-video'
              },
                React.createElement('source', { src: content.videoUrl, type: 'video/mp4' }),
                'Your browser does not support the video tag.'
              ),
          content.videoDescription && React.createElement('p', { className: 'video-description' }, content.videoDescription)
        )
      )
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.KeyframePage = KeyframePage;
