import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { uploadImage } from '../../../settings/utils/theme-bg-uploader';
import { classNames } from '../../../common/utils';
import { setOverlayScreen } from '../../../common/store/redux/appSlice';
import { useSlides } from '../../../common/hooks';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

// Quick Insert: a row of slide buttons (Waheguru, Mool Mantra, etc) that
// scrolls sideways when it doesn't fit.
export const QuickInsert = ({ className }) => {
  const {
    displayWaheguruSlide: waheguruSlide,
    displayMoolMantraSlide: moolMantraSlide,
    displayBlankViewer: blankSlide,
    displayAnandSahibBhog: anandSahibBhog,
  } = useSlides();
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const dispatch = useDispatch();
  const customImageInput = useRef(null);

  const setTab = (tabName) => {
    if (tabName !== overlayScreen) {
      dispatch(setOverlayScreen(tabName));
    }
    analytics.trackEvent({
      category: 'Misc',
      action: 'set-tab',
      label: tabName,
      value: 'openedFromShortcutTray',
    });
  };

  const trayItems = [
    {
      key: 'anand-sahib',
      label: i18n.t(`SHORTCUT_TRAY.ANAND_SAHIB`),
      onClick: () => anandSahibBhog({ openedFrom: 'shortcut-tray' }),
    },
    {
      key: 'mool-mantra',
      label: i18n.t(`SHORTCUT_TRAY.MOOL_MANTRA`),
      onClick: () => moolMantraSlide({ openedFrom: 'shortcut-tray' }),
    },
    {
      key: 'waheguru',
      label: 'ਵਾਹਿਗੁਰੂ',
      onClick: () => waheguruSlide({ openedFrom: 'shortcut-tray' }),
    },
    {
      key: 'blank',
      label: i18n.t(`SHORTCUT_TRAY.BLANK`),
      onClick: () => blankSlide({ openedFrom: 'shortcut-tray' }),
    },
    {
      key: 'custom-image',
      label: i18n.t('SHORTCUT_TRAY.CUSTOM_IMAGE'),
      onClick: () => customImageInput.current.click(),
    },
    {
      key: 'announcement',
      label: i18n.t(`SHORTCUT_TRAY.ANNOUNCEMENT`),
      onClick: () => setTab('announcement'),
    },
  ];

  return (
    <div className={classNames(className, 'quick-insert')}>
      <div className="quick-insert__items">
        {trayItems.map(({ key, label, className: itemClassName, onClick }) => (
          <PrimaryButton
            key={key}
            className={classNames('quick-insert__item', itemClassName)}
            variant="muted"
            size="sm"
            shape="rounded-md"
            onClick={onClick}
          >
            {label}
          </PrimaryButton>
        ))}
        <input
          ref={customImageInput}
          className="file-input"
          onChange={async (e) => {
            await uploadImage(e);
          }}
          id="themebg-upload"
          type="file"
          accept="image/png, image/jpeg"
        />
      </div>
    </div>
  );
};

QuickInsert.propTypes = {
  className: PropTypes.string,
};
