const React = require('react');

const Breadcrumb = ({ items }) => {
  return React.createElement('div', { className: 'breadcrumb' },
    items.map((item, index) => {
      const elements = [];

      if (item.link) {
        elements.push(
          React.createElement('a', {
            key: `link-${index}`,
            href: item.link,
            className: 'breadcrumb-link breadcrumb-home'
          }, item.label)
        );
      } else {
        elements.push(
          React.createElement('span', {
            key: `current-${index}`,
            className: 'breadcrumb-current'
          }, item.label)
        );
      }

      if (index < items.length - 1) {
        elements.push(
          React.createElement('span', {
            key: `sep-${index}`,
            className: 'breadcrumb-separator breadcrumb-home'
          }, ' / ')
        );
      }

      return elements;
    }).flat()
  );
};

exports.Breadcrumb = Breadcrumb;
