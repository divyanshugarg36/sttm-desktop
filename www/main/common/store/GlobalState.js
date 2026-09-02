/* eslint-disable no-param-reassign */
import { createStore, action } from 'easy-peasy';

import { userConfigPath } from './user-settings/get-saved-user-settings';
import { savedOverlaySettings } from './user-settings/get-saved-overlay-settings';

import createOverlaySettingsState from './user-settings/create-overlay-settings-state';

import store from './redux/store';
import { setUserToken } from './redux/appSlice';
import { userSettingsActions } from './redux/userSettingsSlice';
import { navigatorActions } from './redux/navigatorSlice';

const { sidebar, bottomBar } = require('../../../configs/overlay.json');

global.platform = require('../../desktop_scripts');

const GlobalState = createStore({
  // NOTE: `baniController`, `app`, `userSettings`, and `navigator` have been
  // migrated to Redux Toolkit (redux/*Slice.js). Their side effects live in
  // redux/settingsSyncMiddleware.js, and the inbound `update-global-setting` IPC
  // listener below routes those branches to Redux.
  // See EASY-PEASY-TO-REDUX-MIGRATION.md.
  viewerSettings: {
    containerPadding: {
      left: 48,
      top: 20,
      right: 0,
      bottom: 0,
    },
    quickTools: false,
    paddingTools: false,
    setPadding: action((state, payload) => {
      if (global.webview) {
        global.webview.send(
          'update-viewer-setting',
          JSON.stringify({
            payload,
            actionName: 'setPadding',
            settingType: 'viewerSettings',
          }),
        );
      }

      if (global.platform) {
        global.platform.ipc.send(
          'update-viewer-setting',
          JSON.stringify({
            payload,
            actionName: 'setPadding',
            settingType: 'viewerSettings',
          }),
        );
      }
      const newState = state;
      newState.containerPadding[payload.type] = payload.value;

      return newState;
    }),
  },
  baniOverlay: createOverlaySettingsState(
    { ...sidebar.settings, ...bottomBar.settings },
    savedOverlaySettings,
    userConfigPath,
  ),
});

global.platform.ipc.on('update-global-setting', (_event, setting) => {
  const { settingType, actionName, payload } = JSON.parse(setting);
  // `userSettings` + `navigator` now live in Redux; other branches (viewerSettings)
  // remain in easy-peasy.
  if (settingType === 'userSettings') {
    store.dispatch(userSettingsActions[actionName](payload));
  } else if (settingType === 'navigator') {
    store.dispatch(navigatorActions[actionName](payload));
  } else {
    GlobalState.getActions()[settingType][actionName](payload);
  }
});

global.platform.ipc.on('get-overlay-prefs', () => {
  const overlayState = GlobalState.getState().baniOverlay;
  global.platform.ipc.send('save-overlay-settings', JSON.stringify(overlayState));
});

global.platform.ipc.on('userToken', (event, data) => {
  // `app` now lives in Redux — dispatch there instead of easy-peasy.
  const currentToken = store.getState().app.userToken;
  if (data !== currentToken) {
    store.dispatch(setUserToken(data));
  }
});

export default GlobalState;
