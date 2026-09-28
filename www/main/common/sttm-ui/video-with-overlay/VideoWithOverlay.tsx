import React, { useRef } from 'react';

// A video theme's tile: its poster with a caption, playing the video only
// while hovered. Several 1080p videos playing at once as thumbnails run the
// GPU out of hardware decoders, and whichever misses out stays black.
type VideoWithOverlayProps = {
  src?: string;
  poster?: string;
  overlayContent?: React.ReactNode;
};

const VideoWithOverlay = ({ src, poster, overlayContent }: VideoWithOverlayProps) => {
  const video = useRef<HTMLVideoElement>(null);

  const play = () => {
    video.current!.play().catch(() => {});
  };

  // Back to the poster, releasing the decoder.
  const stop = () => {
    video.current!.pause();
    video.current!.load();
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

export default VideoWithOverlay;
