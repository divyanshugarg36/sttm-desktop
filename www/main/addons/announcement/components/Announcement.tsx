import React, { useRef, useEffect, useState } from 'react';
import { GurmukhiKeyboard, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../../common/utils';
import { IconButton } from '../../../common/sttm-ui';
import {
  setIsMiscSlide,
  setMiscSlideText,
  setIsAnnouncement,
  setIsMiscSlideGurmukhi,
} from '../../../common/store/redux/navigatorSlice';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import { analytics, i18n } from '../../../common/main-app';
import { sendToMain } from '../../../common/ipc';

type AnnouncementProps = {
  isGurmukhi: boolean;
};

const Announcement = ({ isGurmukhi }: AnnouncementProps) => {
  const { isMiscSlide, isMiscSlideGurmukhi, miscSlideText, isAnnouncement } = useAppSelector(
    (state) => state.navigator,
  );
  const dispatch = useAppDispatch();

  const [announcementVal, setAnnouncementVal] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const addMiscSlide = (givenText: string) => {
    if (!isMiscSlide) {
      dispatch(setIsMiscSlide(true));
    }
    if (miscSlideText !== givenText) {
      dispatch(setMiscSlideText(givenText));
    }
  };

  const addAnnouncement = () => {
    addMiscSlide(inputRef.current!.value);
    if (isGurmukhi !== isMiscSlideGurmukhi) {
      dispatch(setIsMiscSlideGurmukhi(isGurmukhi));
    }
    if (!isAnnouncement) {
      dispatch(setIsAnnouncement(true));
    }
    analytics.trackEvent({
      category: 'display',
      action: 'announcement-slide',
      label: 'announcement-content',
      value: inputRef.current!.value,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnnouncementVal(event.target.value);
  };

  const getPlaceholderText = (gurmukhiPlaceholder: boolean) => {
    if (gurmukhiPlaceholder) {
      return i18n.t('INSERT.ADD_ANNOUNCEMENT_TEXT_GURMUKHI');
    }
    return i18n.t('INSERT.ADD_ANNOUNCEMENT_TEXT');
  };

  useEffect(() => {
    if (isMiscSlide) {
      sendToMain('show-misc-text', {
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
          <IconButton className="keyboard-toggle" icon="keyboard" onClick={HandleKeyboardToggle} />
        )}
      </div>
      {keyboardOpenStatus && isGurmukhi && (
        <GurmukhiKeyboard
          className="announcement-keyboard"
          title={i18n.t('INSERT.GURMUKHI_KEYBOARD')}
          value={announcementVal}
          onKeyClick={setAnnouncementVal}
          active
          showMatras
        />
      )}
      <div className="announcement-actions">
        <PrimaryButton className="announcement-slide-btn" size="sm" onClick={addAnnouncement}>
          {i18n.t('INSERT.ADD_ANNOUNCEMENT')}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default Announcement;
