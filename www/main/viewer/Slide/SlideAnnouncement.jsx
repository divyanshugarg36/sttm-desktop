import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReactHtmlParser from 'html-react-parser';

const SlideAnnouncement = ({ getFontSize }) => {
  const { announcementsFontSize, leftAlign } = useSelector((state) => state.userSettings);
  const { isMiscSlideGurmukhi, miscSlideText, isAnnouncement } = useSelector(
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

SlideAnnouncement.propTypes = {
  getFontSize: PropTypes.func,
};

export default SlideAnnouncement;
