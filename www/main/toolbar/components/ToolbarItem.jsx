import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { DEFAULT_OVERLAY } from '../../common/constants';
import { setOverlayScreen } from '../../common/store/redux/appSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const ToolbarItem = ({ itemName }) => {
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const userToken = useSelector((state) => state.app.userToken);
  const dispatch = useDispatch();
  const isSelectedOverlay = overlayScreen === itemName;
  const isAuthItem = itemName === 'auth-dialog';
  const displayName = {
    'sync-button': i18n.t('TOOLBAR.BANI_CONTROLLER'),
    'auth-dialog': userToken ? i18n.t('AUTH.LOGOUT_LABEL') : i18n.t('AUTH.LOGIN_LABEL'),
    settings: i18n.t('TOOLBAR.SETTINGS'),
    'sunder-gutka': i18n.t('TOOLBAR.SUNDAR_GUTKA'),
    ceremonies: i18n.t('TOOLBAR.CEREMONIES'),
    announcement: i18n.t('QUICK_TOOLS.ANNOUNCEMENTS'),
  };

  return (
    <div
      id={`tool-${itemName}`}
      className={`toolbar-item ${isAuthItem && userToken ? 'auth-logged-in' : ''}`}
      title={displayName[itemName]}
      onClick={() => {
        document.body.classList.toggle(`overlay-${itemName}-active`, !isSelectedOverlay);
        if (isSelectedOverlay) {
          return dispatch(setOverlayScreen(DEFAULT_OVERLAY));
        }

        return dispatch(setOverlayScreen(itemName));
      }}
    ></div>
  );
};

ToolbarItem.propTypes = {
  itemName: PropTypes.string.isRequired,
};

export default ToolbarItem;
