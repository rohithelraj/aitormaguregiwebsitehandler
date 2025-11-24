const React = require('react');
const { Navigation } = require('../layout/navigation');
const { Footer } = require('../layout/footer');

const AboutPage = ({ about, footerData }) => {
  return React.createElement('div', { className: 'page-container scrollable-page' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'about-content' },
      // Profile Section
      React.createElement('section', { className: 'about-profile' },
        about.profile.photo && React.createElement('div', { className: 'profile-photo' },
          React.createElement('img', { src: about.profile.photo, alt: about.profile.name })
        ),
        React.createElement('div', { className: 'profile-info' },
          React.createElement('h1', { className: 'profile-name' }, about.profile.name),
          React.createElement('h2', { className: 'profile-title' }, about.profile.title),
          about.profile.location && React.createElement('p', { className: 'profile-location' }, about.profile.location),
          about.profile.email && React.createElement('p', { className: 'profile-email' },
            React.createElement('a', { href: `mailto:${about.profile.email}` }, about.profile.email)
          ),
          React.createElement('p', { className: 'profile-bio' }, about.profile.bio)
        )
      ),

      // Skills Section
      about.skills && about.skills.length > 0 && React.createElement('section', { className: 'about-section' },
        React.createElement('h2', { className: 'section-title' }, 'SKILLS'),
        React.createElement('div', { className: 'skills-list' },
          about.skills.map((skill, index) =>
            React.createElement('span', { className: 'skill-item', key: index }, skill)
          )
        )
      ),

      // Software Section
      about.software && about.software.length > 0 && React.createElement('section', { className: 'about-section' },
        React.createElement('h2', { className: 'section-title' }, 'SOFTWARE'),
        React.createElement('div', { className: 'software-list' },
          about.software.map((software, index) =>
            React.createElement('div', { className: 'software-item', key: index },
              software.icon && React.createElement('img', {
                src: software.icon,
                alt: typeof software === 'string' ? software : software.name,
                className: 'software-icon'
              }),
              React.createElement('span', null, typeof software === 'string' ? software : software.name)
            )
          )
        )
      ),

      // Productions Section
      about.productions && about.productions.length > 0 && React.createElement('section', { className: 'about-section' },
        React.createElement('h2', { className: 'section-title' }, 'PRODUCTIONS'),
        React.createElement('div', { className: 'productions-list' },
          about.productions.map((production, index) =>
            React.createElement('div', { className: 'production-item', key: index },
              production.thumbnail && React.createElement('div', { className: 'production-thumbnail' },
                React.createElement('img', { src: production.thumbnail, alt: production.title })
              ),
              React.createElement('div', { className: 'production-details' },
                React.createElement('span', { className: 'production-year' }, production.year),
                React.createElement('h3', { className: 'production-title' }, production.title),
                React.createElement('p', { className: 'production-role' }, production.role),
                React.createElement('p', { className: 'production-company' }, production.company)
              )
            )
          )
        )
      ),

      // Experience Section
      about.experience && about.experience.length > 0 && React.createElement('section', { className: 'about-section' },
        React.createElement('h2', { className: 'section-title' }, 'EXPERIENCE'),
        React.createElement('div', { className: 'experience-list' },
          about.experience.map((exp, index) =>
            React.createElement('div', { className: 'experience-item', key: index },
              React.createElement('div', { className: 'experience-header' },
                React.createElement('span', { className: 'experience-year' }, exp.year),
                React.createElement('h3', { className: 'experience-position' }, exp.position),
                React.createElement('p', { className: 'experience-company' }, exp.company)
              ),
              exp.projects && React.createElement('p', { className: 'experience-projects' }, exp.projects),
              exp.description && React.createElement('p', { className: 'experience-description' }, exp.description)
            )
          )
        )
      )
    ),
    React.createElement(Footer, { footerData: footerData })
  );
};

exports.AboutPage = AboutPage;
