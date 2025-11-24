const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const ColorStudyListPage = ({ colorStudies, currentPage, totalPages, footerData }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Color Study' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'color-study-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'color-study-grid' },
        colorStudies.map((colorStudy, index) => {
          // Calculate the actual color study number based on current page and index
          const colorStudyNumber = ((currentPage - 1) * 6) + index + 1;
          const detailUrl = `/colorStudy/pages/${colorStudy.title.replace(/[^a-zA-Z0-9]/g, '-')}-${colorStudyNumber}.html`;

          return React.createElement('article', { className: 'color-study-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'color-study-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: colorStudy.thumbUrl, alt: colorStudy.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, colorStudy.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/colorStudy/colorStudy-list-'
      })
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.ColorStudyListPage = ColorStudyListPage;
