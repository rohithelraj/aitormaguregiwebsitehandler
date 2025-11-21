const React = require('react');
const { Navigation } = require('../../layout/navigation');
const { Footer } = require('../../layout/footer');
const { Breadcrumb } = require('../../components/Breadcrumb');
const { Pagination } = require('../../components/Pagination');

const StoryboardListPage = ({ storyboards, currentPage, totalPages }) => {
  const breadcrumbItems = [
    { label: 'Home', link: '/index.html' },
    { label: 'Storyboard' }
  ];

  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'storyboard-content' },
      React.createElement(Breadcrumb, { items: breadcrumbItems }),
      React.createElement('div', { className: 'storyboard-grid' },
        storyboards.map((storyboard, index) => {
          // Calculate the actual storyboard number based on current page and index
          const storyboardNumber = ((currentPage - 1) * 8) + index + 1;
          const detailUrl = `/storyboard/pages/${storyboard.title.replace(/[^a-zA-Z0-9]/g, '-')}-${storyboardNumber}.html`;

          return React.createElement('article', { className: 'storyboard-card', key: index },
            React.createElement('a', { href: detailUrl, className: 'storyboard-card-link' },
              React.createElement('div', { className: 'card-image' },
                React.createElement('img', { src: storyboard.thumbUrl, alt: storyboard.title })
              ),
              React.createElement('div', { className: 'card-content' },
                React.createElement('h2', null, storyboard.title)
              )
            )
          );
        })
      ),
      React.createElement(Pagination, {
        currentPage: currentPage,
        totalPages: totalPages,
        baseUrl: '/storyboard/storyboard-list-'
      })
    ),
    React.createElement(Footer)
  );
};

exports.StoryboardListPage = StoryboardListPage;
