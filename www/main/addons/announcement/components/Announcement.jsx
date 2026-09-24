import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { classNames } from '../../../common/utils';
import { IconButton } from '../../../common/sttm-ui';
import { GurmukhiKeyboard } from '../../../navigator/search/components/GurmukhiKeyboard';
import {
  setIsMiscSlide,
  setMiscSlideText,
  setIsAnnouncement,
  setIsMiscSlideGurmukhi,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

const Announcement = ({ isGurmukhi }) => {
  const { isMiscSlide, isMiscSlideGurmukhi, miscSlideText, isAnnouncement } = useSelector(
    (state) => state.navigator,
  );
  const dispatch = useDispatch();

  const [announcementVal, setAnnouncementVal] = useState('');
  const inputRef = useRef(null);

  // Gurmukhi Keyboard
  const [keyboardOpenStatus, setKeyboardOpenStatus] = useState(false);

  const HandleKeyboardToggle = () => {
    setKeyboardOpenStatus(!keyboardOpenStatus);

    analytics.trackEvent({
      category: 'display',
      action: 'announcement-slide',
      label: 'announcement-in-gurmukhi',
      value: isGurmukhi,
    });
  };

  const addMiscSlide = (givenText) => {
    if (!isMiscSlide) {
      dispatch(setIsMiscSlide(true));
    }
    if (miscSlideText !== givenText) {
      dispatch(setMiscSlideText(givenText));
    }
  };

  const addAnnouncement = () => {
    addMiscSlide(inputRef.current.value);
    if (isGurmukhi !== isMiscSlideGurmukhi) {
      dispatch(setIsMiscSlideGurmukhi(isGurmukhi));
    }
    if (!isAnnouncement) {
      dispatch(setIsAnnouncement(true));
    }
    analytics.trackEvent(
      'display',
      'announcement-slide',
      'announcement-content',
      inputRef.current.value,
    );
  };

  const handleChange = (event) => {
    setAnnouncementVal(event.target.value);
  };

  const getPlaceholderText = (gurmukhiPlaceholder) => {
    if (gurmukhiPlaceholder) {
      return i18n.t('INSERT.ADD_ANNOUNCEMENT_TEXT_GURMUKHI');
    }
    return i18n.t('INSERT.ADD_ANNOUNCEMENT_TEXT');
  };

  useEffect(() => {
    if (isMiscSlide) {
      ipcRenderer.send('show-misc-text', {
        text: miscSlideText,
        isGurmukhi: isMiscSlideGurmukhi,
        isAnnouncement,
      });
    }
  }, [miscSlideText, isMiscSlide, isMiscSlideGurmukhi, isAnnouncement]);

  return (
    <div className="announcement-body">
      <div className="textarea-container">
        <textarea
          className={classNames(
            'announcement-text',
            keyboardOpenStatus && isGurmukhi && 'gurmukhi',
            isGurmukhi && 'gurmukhi',
            'disable-kb-shortcuts',
          )}
          placeholder={getPlaceholderText(isGurmukhi)}
          ref={inputRef}
          value={announcementVal}
          onChange={handleChange}
        />
        {isGurmukhi && (
          <IconButton
            className="keyboard-toggle"
            icon="keyboard"
            onClick={HandleKeyboardToggle}
          />
        )}
      </div>
      {keyboardOpenStatus && isGurmukhi && (
        <GurmukhiKeyboard
          title={i18n.t('INSERT.GURMUKHI_KEYBOARD')}
          searchType={2}
          query={announcementVal}
          setQuery={setAnnouncementVal}
        />
      )}
      <div className="announcement-actions">
        <button className="announcement-slide-btn" onClick={addAnnouncement}>
          {i18n.t('INSERT.ADD_ANNOUNCEMENT')}
        </button>
      </div>
    </div>
  );
};

Announcement.propTypes = {
  isGurmukhi: PropTypes.bool,
};

export default Announcement;
