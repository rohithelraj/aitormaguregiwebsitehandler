const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const SketchListPage = ({ sketches, currentPage, totalPages, footerData }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Sketch' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'sketch-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'sketch-grid' },
        sketches.map((sketch, index) => {
          // Calculate the actual sketch number based on current page and index
          const sketchNumber = ((currentPage - 1) * 6) + index + 1;
          const detailUrl = `/sketch/pages/${sketch.title.replace(/[^a-zA-Z0-9]/g, '-')}-${sketchNumber}.html`;

          return React.createElement('article', { className: 'sketch-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'sketch-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: sketch.thumbUrl, alt: sketch.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, sketch.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/sketch/sketch-list-'
      })
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.SketchListPage = SketchListPage;
