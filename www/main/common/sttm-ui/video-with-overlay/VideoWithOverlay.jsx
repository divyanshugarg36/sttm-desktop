import React, { useRef } from 'react';
import PropTypes from 'prop-types';

// A video theme's tile: its poster with a caption, playing the video only
// while hovered. Several 1080p videos playing at once as thumbnails run the
// GPU out of hardware decoders, and whichever misses out stays black.
const VideoWithOverlay = ({ src, poster, overlayContent }) => {
  const video = useRef(null);

  const play = () => {
    video.current.play().catch(() => {});
  };

  // Back to the poster, releasing the decoder.
  const stop = () => {
    video.current.pause();
    video.current.load();
  };

  return (
    <div className="video-tile" onMouseEnter={play} onMouseLeave={stop}>
      <video
        ref={video}
        className="video-tile__video"
        src={src}
        poster={poster}
        preload="none"
        muted
        loop
        playsInline
      />
      <div className="video-tile__caption">{overlayContent}</div>
    </div>
  );
};

VideoWithOverlay.propTypes = {
  src: PropTypes.string,
  poster: PropTypes.string,
  overlayContent: PropTypes.node,
};

export default VideoWithOverlay;
