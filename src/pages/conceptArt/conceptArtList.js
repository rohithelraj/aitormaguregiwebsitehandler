const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const ConceptArtListPage = ({ conceptArts, currentPage, totalPages, footerData }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Concept Art' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'concept-art-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'concept-art-grid' },
        conceptArts.map((conceptArt, index) => {
          // Calculate the actual concept art number based on current page and index
          const conceptArtNumber = ((currentPage - 1) * 6) + index + 1;
          const detailUrl = `/conceptArt/pages/${conceptArt.title.replace(/[^a-zA-Z0-9]/g, '-')}-${conceptArtNumber}.html`;

          return React.createElement('article', { className: 'concept-art-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'concept-art-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: conceptArt.thumbUrl, alt: conceptArt.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, conceptArt.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/conceptArt/conceptArt-list-'
      })
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.ConceptArtListPage = ConceptArtListPage;
