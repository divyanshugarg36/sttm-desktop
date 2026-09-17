import { configureStore } from '@reduxjs/toolkit';

import appReducer, { setUserToken } from './appSlice';
import baniControllerReducer from './baniControllerSlice';
import userSettingsReducer, { userSettingsActions } from './userSettingsSlice';
import navigatorReducer, { navigatorActions } from './navigatorSlice';
import viewerSettingsReducer, { viewerSettingsActions } from './viewerSettingsSlice';
import baniOverlayReducer, { baniOverlayActions } from './baniOverlaySlice';
import settingsSyncMiddleware from './settingsSyncMiddleware';

// Main-window Redux store — the single source of truth after the easy-peasy
// removal. It also owns the main-window globals + inbound IPC listeners that
// used to live in the easy-peasy GlobalState. Only the main window imports this
// module (the viewer/overlay windows have their own stores), so these listeners
// register once, in the right process. See EASY-PEASY-TO-REDUX-MIGRATION.md.
global.platform = require('../../../desktop_scripts');

const store = configureStore({
  reducer: {
    app: appReducer,
    baniController: baniControllerReducer,
    userSettings: userSettingsReducer,
    navigator: navigatorReducer,
    viewerSettings: viewerSettingsReducer,
    baniOverlay: baniOverlayReducer,
  },
  // Settings side effects (IPC/fs/DOM/socket) live in this middleware; reducers
  // stay pure.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsSyncMiddleware),
});

// Globals that non-React modules read/write synchronously (quick-tools-utils,
// desktop_scripts, and the middleware's mirror). getUserSettings is a plain
// snapshot the middleware keeps current; setUserSettings maps each setter name
// to a dispatch.
global.getUserSettings = { ...store.getState().userSettings };
global.setUserSettings = Object.keys(userSettingsActions).reduce((acc, name) => {
  acc[name] = (value) => store.dispatch(userSettingsActions[name](value));
  return acc;
}, {});

// Inbound IPC (previously registered in GlobalState).
if (global.platform && global.platform.ipc) {
  const actionsBySettingType = {
    userSettings: userSettingsActions,
    navigator: navigatorActions,
    viewerSettings: viewerSettingsActions,
    baniOverlay: baniOverlayActions,
  };

  global.platform.ipc.on('update-global-setting', (_event, setting) => {
    const { settingType, actionName, payload } = JSON.parse(setting);
    const actions = actionsBySettingType[settingType];
    if (actions && actions[actionName]) {
      store.dispatch(actions[actionName](payload));
    }
  });

  global.platform.ipc.on('get-overlay-prefs', () => {
    global.platform.ipc.send('save-overlay-settings', JSON.stringify(store.getState().baniOverlay));
  });

  global.platform.ipc.on('userToken', (_event, data) => {
    if (data !== store.getState().app.userToken) {
      store.dispatch(setUserToken(data));
    }
  });
}

export default store;
