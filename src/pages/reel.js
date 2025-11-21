const React = require('react');
const { Navigation } = require('../layout/navigation');
const { Footer } = require('../layout/footer');

const ReelPage = ({ reel }) => {
  return React.createElement('div', { className: 'page-container' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'reel-content' },
      React.createElement('div', { className: 'reel-container' },
        React.createElement('h1', { className: 'reel-title' }, reel.reelName),
        React.createElement('div', { className: 'video-wrapper' },
          React.createElement('video', {
            src: reel.src,
            controls: true,
            className: 'reel-video'
          })
        )
      )
    ),
    React.createElement(Footer)
  );
};

exports.ReelPage = ReelPage;