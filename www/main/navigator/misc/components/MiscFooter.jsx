import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { uploadImage } from '../../../settings/utils/theme-bg-uploader';
import { classNames } from '../../../common/utils';
import { setOverlayScreen } from '../../../common/store/redux/appSlice';
import { setShortcutTray } from '../../../common/store/redux/userSettingsSlice';
import { setVerseHistory } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

export const MiscFooter = ({ waheguruSlide, moolMantraSlide, blankSlide, anandSahibBhog }) => {
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const dispatch = useDispatch();
  const { shortcutTray } = useSelector((state) => state.userSettings);
  const drawerRef = useRef(null);
  const customImageInput = useRef(null);

  // Event Handlers
  const clearHistory = () => {
    dispatch(setVerseHistory([]));
  };

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
        'misc-footer',
        shortcutTray ? 'shortcut-tray-active' : 'shortcut-tray-inactive',
      )}
      ref={drawerRef}
    >
      <div className="clear-pane">
        <div
          className={`quick-tray ${shortcutTray ? 'footer-toggler-inactive' : 'footer-toggler'}`}
          onClick={() => {
            toggleTray(!shortcutTray);
          }}
        >
          <Icon name={shortcutTray ? 'chevron-down' : 'chevron-up'} />
          <span>{i18n.t(`SHORTCUT_TRAY.QUICK_INSERT`)}</span>
        </div>
        <PrimaryButton
          className="clear-history"
          variant="ghost"
          size="sm"
          leftIcon={<Icon name="clock" />}
          onClick={clearHistory}
        >
          {i18n.t(`SHORTCUT_TRAY.CLEAR_HISTORY`)}
        </PrimaryButton>
      </div>
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

MiscFooter.propTypes = {
  waheguruSlide: PropTypes.func,
  moolMantraSlide: PropTypes.func,
  blankSlide: PropTypes.func,
  anandSahibBhog: PropTypes.func,
};
