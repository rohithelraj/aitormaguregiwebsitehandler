const React = require('react');

const Navigation = () => {
  return React.createElement('nav', { className: 'main-nav' },
    React.createElement('div', { className: 'logo' },
      React.createElement('h1', null, 'AITOR MAGUREGI'),
      React.createElement('h2', null, 'DIGITAL VISUAL ARTIST')
    ),
    React.createElement('button', {
      className: 'hamburger-menu',
      'aria-label': 'Toggle menu',
      onClick: () => {}
    },
      React.createElement('span', null),
      React.createElement('span', null),
      React.createElement('span', null)
    ),
    React.createElement('div', { className: 'nav-links', id: 'navLinks' },
      React.createElement('a', { href: '/index.html' }, 'HOME'),
      React.createElement('a', { href: '/reel.html' }, 'REEL'),
      React.createElement('div', { className: 'dropdown' },
        React.createElement('span', { className: 'dropdown-trigger' }, 'WORK'),
        React.createElement('div', { className: 'dropdown-content' },
          React.createElement('a', { href: '/mattePainting/mattePainting-list-1.html' }, 'MATTE PAINTING'),
          React.createElement('a', { href: '/conceptArt/conceptArt-list-1.html' }, 'CONCEPT ART'),
          React.createElement('a', { href: '/keyframe/keyframe-list-1.html' }, 'KEYFRAME'),
          React.createElement('a', { href: '/colorStudy/colorStudy-list-1.html' }, 'COLOR STUDY'),
          React.createElement('a', { href: '/sketch/sketch-list-1.html' }, 'SKETCH'),
          React.createElement('a', { href: '/storyboard/storyboard-list-1.html' }, 'STORYBOARD'),
          React.createElement('a', { href: '/photography/photography-list-1.html' }, 'PHOTOGRAPHY')
        )
      ),
      React.createElement('a', { href: '/about.html' }, 'ABOUT')
    )
  );
};

exports.Navigation = Navigation;