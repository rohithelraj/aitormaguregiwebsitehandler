const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');

const PhotographyPage = ({ content }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Photography', link: '/photography/photography-list-1.html' },
    { label: content.title }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'photography-detail-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'photography-detail' },
        content.image && React.createElement('div', { className: 'detail-image-section' },
          React.createElement('img', {
            src: content.image,
            alt: content.title,
            className: 'detail-image'
          })
        ),
        React.createElement('div', { className: 'detail-text-section' },
          content.title && React.createElement('h1', { className: 'detail-title' }, content.title),
          content.description && React.createElement('p', { className: 'detail-description' }, content.description)
        )
      )
    ),
    React.createElement(Footer)
  );
};

exports.PhotographyPage = PhotographyPage;
