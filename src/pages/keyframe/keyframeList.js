const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const KeyframeListPage = ({ keyframes, currentPage, totalPages, footerData }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Keyframe' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'keyframe-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'keyframe-grid' },
        keyframes.map((keyframe, index) => {
          // Calculate the actual keyframe number based on current page and index
          const keyframeNumber = ((currentPage - 1) * 6) + index + 1;
          const detailUrl = `/keyframe/pages/${keyframe.title.replace(/[^a-zA-Z0-9]/g, '-')}-${keyframeNumber}.html`;

          return React.createElement('article', { className: 'keyframe-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'keyframe-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: keyframe.thumbUrl, alt: keyframe.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, keyframe.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/keyframe/keyframe-list-'
      })
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.KeyframeListPage = KeyframeListPage;
