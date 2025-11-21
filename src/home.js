const React = require('react');
const { Navigation } = require('../src/layout/navigation');
const { Footer } = require('../src/layout/footer');

const HomePage = ({ images }) => {
  return React.createElement('div', { className: 'page-container' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'main-content' },
      React.createElement('div', { className: 'image-container' },
        images.map((image, index) => [
          React.createElement('img', {
            key: `img-${index}`,
            src: image.src,
            alt: image.imageName,
            className: `gallery-image ${index === 0 ? 'active' : ''}`,
          }),
          React.createElement('h2', {
            key: `title-${index}`,
            className: `image-title ${index === 0 ? 'active' : ''}`,
          }, image.imageName)
        ]),
        React.createElement('button', {
          className: 'nav-arrow left',
          type: 'button'
        }, '←'),
        React.createElement('button', {
          className: 'nav-arrow right',
          type: 'button'
        }, '→')
      )
    ),
    React.createElement(Footer)
  );
};

exports.HomePage = HomePage;