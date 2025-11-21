const React = require('react');

const Pagination = ({ currentPage, totalPages, baseUrl }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return React.createElement('div', { className: 'pagination' },
    currentPage > 1
      ? React.createElement('a', {
          href: `${baseUrl}${currentPage - 1}.html`,
          className: 'page-btn'
        }, '←')
      : React.createElement('span', { className: 'page-btn disabled' }, '←'),
    pages.map(page =>
      page === currentPage
        ? React.createElement('span', {
            key: page,
            className: 'page-btn active'
          }, page)
        : React.createElement('a', {
            key: page,
            href: `${baseUrl}${page}.html`,
            className: 'page-btn'
          }, page)
    ),
    currentPage < totalPages
      ? React.createElement('a', {
          href: `${baseUrl}${currentPage + 1}.html`,
          className: 'page-btn'
        }, '→')
      : React.createElement('span', { className: 'page-btn disabled' }, '→')
  );
};

exports.Pagination = Pagination;
