const React = require('react');
const { Navigation } = require('../layout/navigation');
const { Footer } = require('../layout/footer');

const ReelPage = ({ reel }) => {
  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;

    // Check if it's already an embed URL
    if (url.includes('/embed/')) {
      return url;
    }

    // Extract video ID from various YouTube URL formats
    let videoId = null;

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }

    // Format: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // If we found a video ID, return embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Not a YouTube URL, return original (for mp4 files, etc.)
    return url;
  };

  const isYouTubeUrl = (url) => {
    return url && (url.includes('youtube.com') || url.includes('youtu.be'));
  };

  return React.createElement('div', { className: 'page-container' },
    React.createElement(Navigation),
    React.createElement('main', { className: 'reel-content' },
      React.createElement('div', { className: 'reel-container' },
        React.createElement('h1', { className: 'reel-title' }, reel.reelName),
        React.createElement('div', { className: 'video-wrapper' },
          isYouTubeUrl(reel.src)
            ? React.createElement('iframe', {
                src: getYouTubeEmbedUrl(reel.src),
                className: 'reel-video youtube-video',
                frameBorder: '0',
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                allowFullScreen: true
              })
            : React.createElement('video', {
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