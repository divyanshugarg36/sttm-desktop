import React from 'react';
import ReactHtmlParser from 'html-react-parser';
import { useViewerSelector } from '../store/hooks';
import type { GetFontSize } from '../types';

type SlideAnnouncementProps = {
  getFontSize: GetFontSize;
  isMiscSlide?: boolean;
};

const SlideAnnouncement = ({ getFontSize }: SlideAnnouncementProps) => {
  const { announcementsFontSize, leftAlign } = useViewerSelector((state) => state.userSettings);
  const { isMiscSlideGurmukhi, miscSlideText, isAnnouncement } = useViewerSelector(
    (state) => state.navigator,
  );
  let gurmukhi = true;

  if (isAnnouncement) {
    gurmukhi = isMiscSlideGurmukhi;
  }

  return (
    <div className={`slide-announcement ${leftAlign ? 'slide-left-align' : ''}`}>
      <span
        style={getFontSize(announcementsFontSize)}
        className={gurmukhi ? 'gurmukhi-announcement-slide' : ''}
      >
        {ReactHtmlParser(miscSlideText)}
      </span>
    </div>
  );
};

export default SlideAnnouncement;
