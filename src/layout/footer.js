const React = require('react');

const Footer = () => {
  return React.createElement('footer', { className: 'main-footer' },
    React.createElement('div', { className: 'social-links' },
      React.createElement('a', { href: '#', className: 'social-icon' },
        React.createElement('img', { src: 'icons/vimeo.png', alt: 'Vimeo', width: 24, height: 24 })
      ),
      React.createElement('a', { href: '#', className: 'social-icon' },
        React.createElement('img', { src: 'icons/youtube.png', alt: 'YouTube', width: 24, height: 24 })
      ),
      React.createElement('a', { href: 'https://www.linkedin.com/in/aitormaguregi', className: 'social-icon', target: '_blank', rel: 'noopener noreferrer' },
        React.createElement('img', { src: 'icons/linkedin.png', alt: 'LinkedIn', width: 24, height: 24 })
      ),
      React.createElement('a', { href: 'https://www.instagram.com/aitor.maguregi/', className: 'social-icon', target: '_blank', rel: 'noopener noreferrer' },
        React.createElement('img', { src: 'icons/instagram.png', alt: 'Instagram', width: 24, height: 24 })
      ),
        React.createElement('a', { href: '#', className: 'social-icon' },
            React.createElement('img', { src: 'icons/artstation.png', alt: 'ArtStation', width: 24, height: 24 })
        )
    ),
    React.createElement('div', { className: 'copyright' },
      '©Aitor Maguregi 2025'
    )
  );
};

exports.Footer = Footer;