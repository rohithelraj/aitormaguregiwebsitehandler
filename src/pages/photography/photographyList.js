const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const PhotographyListPage = ({ photos, currentPage, totalPages }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Photography' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'photography-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'photography-grid' },
        photos.map((photo, index) => {
          // Calculate the actual photo number based on current page and index
          const photoNumber = ((currentPage - 1) * 8) + index + 1;
          const detailUrl = `/photography/pages/${photo.title.replace(/[^a-zA-Z0-9]/g, '-')}-${photoNumber}.html`;

          return React.createElement('article', { className: 'photo-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'photo-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: photo.thumbUrl, alt: photo.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, photo.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/photography/photography-list-'
      })
    ),
    React.createElement(Footer)
  );
};

exports.PhotographyListPage = PhotographyListPage;
