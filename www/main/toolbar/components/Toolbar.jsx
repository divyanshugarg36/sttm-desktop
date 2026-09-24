import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SideNav } from '@khalisfoundation/sikhi-ui';

import { DEFAULT_OVERLAY } from '../../common/constants';
import { setOverlayScreen } from '../../common/store/redux/appSlice';
import { Icon } from '../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const Toolbar = () => {
  const { minimizedBySingleDisplay } = useSelector((state) => state.navigator);
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const userToken = useSelector((state) => state.app.userToken);
  const dispatch = useDispatch();

  const item = (key, label, icon) => ({ key, label, icon: <Icon name={icon} /> });
  const toolbarTop = [
    item('sunder-gutka', i18n.t('TOOLBAR.SUNDAR_GUTKA'), 'sundar-gutka'),
    item('ceremonies', i18n.t('TOOLBAR.CEREMONIES'), 'flower'),
    item('announcement', i18n.t('SHORTCUT_TRAY.ANNOUNCEMENT'), 'volume-high'),
  ];
  const toolbarBottom = [
    item('sync-button', i18n.t('TOOLBAR.BANI_CONTROLLER'), 'bani-controller'),
    userToken
      ? item('auth-dialog', i18n.t('AUTH.LOGOUT_LABEL'), 'logout')
      : item('auth-dialog', i18n.t('AUTH.LOGIN_LABEL'), 'user'),
    item('settings', i18n.t('TOOLBAR.SETTINGS'), 'cog'),
  ];

  // Clicking an item opens its overlay, or closes it when it is already open.
  const toggleOverlay = (itemName) => {
    const isSelectedOverlay = overlayScreen === itemName;
    document.body.classList.toggle(`overlay-${itemName}-active`, !isSelectedOverlay);
    dispatch(setOverlayScreen(isSelectedOverlay ? DEFAULT_OVERLAY : itemName));
  };

  return (
    <div
      id="toolbar-nav"
      className={`${
        minimizedBySingleDisplay ? 'single-display-hide-left' : 'single-display-show-left'
      }`}
    >
      <SideNav
        className="toolbar-top"
        items={toolbarTop}
        activeKey={overlayScreen}
        onSelect={toggleOverlay}
      />
      <SideNav
        className="toolbar-bottom"
        items={toolbarBottom}
        activeKey={overlayScreen}
        onSelect={toggleOverlay}
      />
    </div>
  );
};

export default Toolbar;
