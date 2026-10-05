/* eslint-disable no-param-reassign */
import { createStore, action } from 'easy-peasy';

import { DEFAULT_OVERLAY } from '../constants';

import createUserSettingsState from './user-settings/create-user-settings-state';
import createNavigatorSettingsState from './navigator-settings/create-navigator-settings';

import { savedSettings, userConfigPath } from './user-settings/get-saved-user-settings';
import { savedOverlaySettings } from './user-settings/get-saved-overlay-settings';

import createOverlaySettingsState from './user-settings/create-overlay-settings-state';

const { sidebar, bottomBar } = require('../../../configs/overlay.json');
const { settings } = require('../../../configs/user-settings.json');
const navigatorSettings = require('../../../configs/navigator-settings.json');

global.platform = require('../../desktop_scripts');

const GlobalState = createStore({
  app: {
    overlayScreen: DEFAULT_OVERLAY,
    isListeners: false,
    userToken: '',
    setOverlayScreen: action((state, payload) => {
      state.overlayScreen = payload;
    }),
    setListeners: action((state, listenersState) => {
      state.isListeners = listenersState;
    }),
    setUserToken: action((state, payload) => {
      state.userToken = payload;
    }),
  },
  baniController: {
    adminPin: null,
    code: null,
    isConnected: false,
    setAdminPin: action((state, adminPin) => {
      state.adminPin = adminPin;
    }),
    setCode: action((state, code) => {
      state.code = code;
    }),
    setConnection: action((state, connectionState) => {
      state.isConnected = connectionState;
    }),
  },
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

// The displays (the preview and the projector window) only hear about changes.
// When one (re)loads, e.g. after a crash or when a slide went up before it had
// finished loading, send it everything that's showing now.
export const sendNavigatorStateToDisplays = () => {
  const { navigator } = GlobalState.getState();
  Object.keys(navigator).forEach((stateName) => {
    const setting = JSON.stringify({
      stateName,
      payload: navigator[stateName],
      actionName: `set${stateName.charAt(0).toUpperCase()}${stateName.slice(1)}`,
      settingType: 'navigator',
    });
    if (global.webview) global.webview.send('update-viewer-setting', setting);
    global.platform.ipc.send('update-viewer-setting', setting);
  });
};

global.platform.ipc.on('viewer-loaded', sendNavigatorStateToDisplays);

global.platform.ipc.on('get-overlay-prefs', () => {
  const overlayState = GlobalState.getState().baniOverlay;
  global.platform.ipc.send('save-overlay-settings', JSON.stringify(overlayState));
});

global.platform.ipc.on('userToken', (event, data) => {
  const currentToken = GlobalState.getState().app.userToken;
  if (data !== currentToken) {
    GlobalState.getActions().app.setUserToken(data);
  }
});

export default GlobalState;
