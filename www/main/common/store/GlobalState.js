/* eslint-disable no-param-reassign */
import { createStore, action } from 'easy-peasy';

import createUserSettingsState from './user-settings/create-user-settings-state';
import createNavigatorSettingsState from './navigator-settings/create-navigator-settings';

import { savedSettings, userConfigPath } from './user-settings/get-saved-user-settings';
import { savedOverlaySettings } from './user-settings/get-saved-overlay-settings';

import createOverlaySettingsState from './user-settings/create-overlay-settings-state';

import store from './redux/store';
import { setUserToken } from './redux/appSlice';

const { sidebar, bottomBar } = require('../../../configs/overlay.json');
const { settings } = require('../../../configs/user-settings.json');
const navigatorSettings = require('../../../configs/navigator-settings.json');

global.platform = require('../../desktop_scripts');

const GlobalState = createStore({
  // NOTE: `baniController` (redux/baniControllerSlice.js) and `app`
  // (redux/appSlice.js) have been migrated to Redux Toolkit — the `app` branch
  // now lives in Redux; its inbound `userToken` IPC listener below dispatches
  // there. See EASY-PEASY-TO-REDUX-MIGRATION.md.
  navigator: createNavigatorSettingsState(navigatorSettings),
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
  userSettings: createUserSettingsState(settings, savedSettings, userConfigPath),
  baniOverlay: createOverlaySettingsState(
    { ...sidebar.settings, ...bottomBar.settings },
    savedOverlaySettings,
    userConfigPath,
  ),
});

global.platform.ipc.on('update-global-setting', (_event, setting) => {
  const { settingType, actionName, payload } = JSON.parse(setting);
  GlobalState.getActions()[settingType][actionName](payload);
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
