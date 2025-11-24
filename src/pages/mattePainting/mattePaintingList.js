const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const MattePaintingListPage = ({ mattePaintings, currentPage, totalPages }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Matte Painting' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'matte-painting-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'matte-painting-grid' },
        mattePaintings.map((mattePainting, index) => {
          // Calculate the actual matte painting number based on current page and index
          const mattePaintingNumber = ((currentPage - 1) * 6) + index + 1;
          const detailUrl = `/mattePainting/pages/${mattePainting.title.replace(/[^a-zA-Z0-9]/g, '-')}-${mattePaintingNumber}.html`;

          return React.createElement('article', { className: 'matte-painting-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'matte-painting-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: mattePainting.thumbUrl, alt: mattePainting.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, mattePainting.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/mattePainting/mattePainting-list-'
      })
    ),
    React.createElement(Footer)
  );
};

exports.MattePaintingListPage = MattePaintingListPage;
