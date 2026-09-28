import React from 'react';
import PropTypes from 'prop-types';

// A looping, muted video with a caption over it (the theme picker's video
// themes).
const VideoWithOverlay = ({ src, overlayContent }) => (
  <div className="video-tile">
    <video className="video-tile__video" src={src} autoPlay muted loop />
    <div className="video-tile__caption">{overlayContent}</div>
  </div>
);

VideoWithOverlay.propTypes = {
  src: PropTypes.string,
  overlayContent: PropTypes.node,
};

export default VideoWithOverlay;
