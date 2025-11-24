const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');

const MattePaintingPage = ({ content }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Matte Painting', link: '/mattePainting/mattePainting-list-1.html' },
    { label: content.tilte || content.title }
  ];

  const hasToggle = content.mainImage && content.mainImageToggle;

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'matte-painting-detail-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'matte-painting-detail' },
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
          React.createElement('span', { className: 'modal-close' }, '×'),
          React.createElement('div', { className: 'modal-content-wrapper' },
            React.createElement('img', { id: 'modalImage', className: 'modal-image', src: '', alt: '' }),
            React.createElement('div', { id: 'modalCaption', className: 'modal-caption' })
          )
        ),

        // Video section
        content.videoUrl && React.createElement('div', { className: 'video-section' },
          React.createElement('h2', { className: 'video-title' }, 'Video'),
          React.createElement('video', {
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
    React.createElement(Footer)
  );
};

exports.MattePaintingPage = MattePaintingPage;
