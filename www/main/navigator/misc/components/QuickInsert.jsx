import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { uploadImage } from '../../../settings/utils/theme-bg-uploader';
import { classNames } from '../../../common/utils';
import { setOverlayScreen } from '../../../common/store/redux/appSlice';
import { setShortcutTray } from '../../../common/store/redux/userSettingsSlice';
import { Icon } from '../../../common/sttm-ui';
import { useSlides } from '../../../common/hooks';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

// The Quick Insert toggle and its drawer of slides (Waheguru, Mool Mantra, etc).
export const QuickInsert = () => {
  const {
    displayWaheguruSlide: waheguruSlide,
    displayMoolMantraSlide: moolMantraSlide,
    displayBlankViewer: blankSlide,
    displayAnandSahibBhog: anandSahibBhog,
  } = useSlides();
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const dispatch = useDispatch();
  const { shortcutTray } = useSelector((state) => state.userSettings);
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

  const toggleTray = (toggleValue) => {
    dispatch(setShortcutTray(toggleValue));
    analytics.trackEvent({
      category: 'shortcutTray',
      action: 'toggleTray',
      label: toggleValue ? 'openTray' : 'closeTray',
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
      label: 'vwihgurU',
      className: 'gurmukhi',
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
    <div
      className={classNames(
        'quick-insert',
        shortcutTray ? 'shortcut-tray-active' : 'shortcut-tray-inactive',
      )}
    >
      <PrimaryButton
        className="quick-tray"
        variant="ghost"
        size="sm"
        leftIcon={<Icon name={shortcutTray ? 'chevron-down' : 'chevron-up'} />}
        aria-expanded={shortcutTray}
        onClick={() => toggleTray(!shortcutTray)}
      >
        {i18n.t(`SHORTCUT_TRAY.QUICK_INSERT`)}
      </PrimaryButton>
      <div
        className={`shortcut-drawer ${
          shortcutTray ? 'shortcut-drawer-active' : 'shortcut-drawer-inactive'
        }`}
      >
        {trayItems.map(({ key, label, className, onClick }) => (
          <PrimaryButton
            key={key}
            className={classNames('tray-item-icon', className)}
            variant="amber"
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
