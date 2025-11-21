const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');

const StoryboardPage = ({ content }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Storyboard', link: '/storyboard/storyboard-list-1.html' },
    { label: content.title }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'storyboard-detail-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'storyboard-detail' },
        React.createElement('div', { className: 'storyboard-header' },
          content.title && React.createElement('h1', { className: 'detail-title' }, content.title),
          content.description && React.createElement('p', { className: 'detail-description' }, content.description)
        ),
        content.images && React.createElement('div', { className: 'storyboard-images' },
          content.images.map((image, index) =>
            React.createElement('div', { className: 'storyboard-image-item', key: index },
              React.createElement('img', { src: image.url, alt: image.name, className: 'storyboard-image' }),
              React.createElement('div', { className: 'image-caption' },
                image.name && React.createElement('h3', { className: 'image-name' }, image.name),
                image.description && React.createElement('p', { className: 'image-description' }, image.description)
              )
            )
          )
        )
      )
    ),
    React.createElement(Footer)
  );
};

exports.StoryboardPage = StoryboardPage;
