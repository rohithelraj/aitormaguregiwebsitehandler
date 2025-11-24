const React = require('react');

const Footer = ({ footerData }) => {
  // Fallback to default values if no footerData provided
  const defaultFooterData = {
    socialLinks: [
      { name: 'Vimeo', url: 'https://vimeo.com/aitormaguregi', icon: '/icons/vimeo.png' },
      { name: 'YouTube', url: 'https://www.youtube.com/@aitormaguregi', icon: '/icons/youtube.png' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com/in/aitormaguregi', icon: '/icons/linkedin.png' },
      { name: 'Instagram', url: 'https://www.instagram.com/aitor.maguregi/', icon: '/icons/instagram.png' },
      { name: 'ArtStation', url: 'https://www.artstation.com/aitormaguregi', icon: '/icons/artstation.png' }
    ],
    copyright: '©Aitor Maguregi 2025'
  };

  const footer = footerData || defaultFooterData;

  return React.createElement('footer', { className: 'main-footer' },
    React.createElement('div', { className: 'social-links' },
      footer.socialLinks.map((link, index) =>
        React.createElement('a', {
          key: index,
          href: link.url || '#',
          className: 'social-icon',
          target: '_blank',
          rel: 'noopener noreferrer'
        },
          React.createElement('img', {
            src: link.icon,
            alt: link.name,
            width: 24,
            height: 24
          })
        )
      )
    ),
    React.createElement('div', { className: 'copyright' },
      footer.copyright
    )
  );
};

exports.Footer = Footer;