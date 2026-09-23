import { configureStore, type UnknownAction } from '@reduxjs/toolkit';

import appReducer, { setUserToken } from './appSlice';
import baniControllerReducer from './baniControllerSlice';
import userSettingsReducer, { userSettingsActions } from './userSettingsSlice';
import navigatorReducer, { navigatorActions } from './navigatorSlice';
import viewerSettingsReducer, { viewerSettingsActions } from './viewerSettingsSlice';
import baniOverlayReducer, { baniOverlayActions } from './baniOverlaySlice';
import settingsSyncMiddleware from './settingsSyncMiddleware';
import platform from '../../../desktop_scripts';

// Main-window Redux store — the single source of truth after the easy-peasy
// removal. It also owns the main-window globals + inbound IPC listeners that
// used to live in the easy-peasy GlobalState. Only the main window imports this
// module (the viewer/overlay windows have their own stores), so these listeners
// register once, in the right process. See EASY-PEASY-TO-REDUX-MIGRATION.md.
global.platform = platform;

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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** Action creators looked up by name at runtime (settings setters and IPC). */
type ActionCreatorsByName = Record<string, (payload: unknown) => UnknownAction>;

// Globals that non-React modules read/write synchronously (quick-tools-utils,
// desktop_scripts, and the middleware's mirror). getUserSettings is a plain
// snapshot the middleware keeps current; setUserSettings maps each setter name
// to a dispatch.
global.getUserSettings = { ...store.getState().userSettings };
const userSettingsActionsByName = userSettingsActions as unknown as ActionCreatorsByName;
global.setUserSettings = Object.keys(userSettingsActionsByName).reduce<
  Record<string, (value: unknown) => void>
>((acc, name) => {
  acc[name] = (value) => store.dispatch(userSettingsActionsByName[name](value));
  return acc;
}, {});

// Inbound IPC (previously registered in GlobalState).
if (global.platform && global.platform.ipc) {
  const { ipc } = global.platform;
  const actionsBySettingType = {
    userSettings: userSettingsActions,
    navigator: navigatorActions,
    viewerSettings: viewerSettingsActions,
    baniOverlay: baniOverlayActions,
  } as unknown as Record<string, ActionCreatorsByName | undefined>;

  ipc.on('update-global-setting', (_event, setting: string) => {
    const { settingType, actionName, payload } = JSON.parse(setting) as {
      settingType: string;
      actionName: string;
      payload: unknown;
    };
    const actions = actionsBySettingType[settingType];
    if (actions && actions[actionName]) {
      store.dispatch(actions[actionName](payload));
    }
  });

  ipc.on('get-overlay-prefs', () => {
    ipc.send('save-overlay-settings', JSON.stringify(store.getState().baniOverlay));
  });

  ipc.on('userToken', (_event, data: string) => {
    if (data !== store.getState().app.userToken) {
      store.dispatch(setUserToken(data));
    }
  });
}

export default store;
