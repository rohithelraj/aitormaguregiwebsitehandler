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
        React.createElement('a', { href: '/work.html' }, 'WORK'),
        React.createElement('div', { className: 'dropdown-content' },
          React.createElement('a', { href: '/matte-painting.html' }, 'MATTE PAINTING'),
          React.createElement('a', { href: '/concept-art.html' }, 'CONCEPT ART'),
          React.createElement('a', { href: '/keyframe.html' }, 'KEYFRAME'),
          React.createElement('a', { href: '/color-study.html' }, 'COLOR STUDY'),
          React.createElement('a', { href: '/sketch.html' }, 'SKETCH'),
          React.createElement('a', { href: '/storyboard/storyboard-list-1.html' }, 'STORYBOARD'),
          React.createElement('a', { href: '/photography/photography-list-1.html' }, 'PHOTOGRAPHY')
        )
      ),
      React.createElement('a', { href: '/about.html' }, 'ABOUT'),
      React.createElement('a', { href: '/contact.html' }, 'CONTACT')
    )
  );
};

exports.Navigation = Navigation;