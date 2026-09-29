import { configureStore, type UnknownAction } from '@reduxjs/toolkit';

import userSettingsReducer, {
  userSettingsActions,
} from '../../common/store/redux/userSettingsSlice';
import navigatorReducer, { navigatorActions } from '../../common/store/redux/navigatorSlice';
import viewerSettingsReducer, {
  viewerSettingsActions,
} from '../../common/store/redux/viewerSettingsSlice';
import { onFromMain } from '../../common/ipc';
import platform from '../../desktop_scripts';

// Redux store for the viewer window (replaces the easy-peasy ViewerState). It
// reuses the userSettings + navigator slices (their initial state comes from the
// shared config/saved-settings the slices load) plus a viewer-local
// viewerSettings slice. The window is a SHADOW: the main window is the source of
// truth and pushes every change here over `update-viewer-setting`, which the
// listener below turns into a dispatch. No settings-sync middleware — the viewer
// never broadcasts settings; its own tool toggles are local, and setting changes
// it initiates go to the main window via `update-global-setting` (unchanged).
// See EASY-PEASY-TO-REDUX-MIGRATION.md.

global.platform = platform;

const viewerStore = configureStore({
  reducer: {
    userSettings: userSettingsReducer,
    navigator: navigatorReducer,
    viewerSettings: viewerSettingsReducer,
  },
});

/** The viewer window's state: its shadow of the main window's slices. */
export type ViewerRootState = ReturnType<typeof viewerStore.getState>;
export type ViewerDispatch = typeof viewerStore.dispatch;

/** Action creators looked up by name (the IPC message names the action). */
type ActionCreatorsByName = Record<string, (payload: unknown) => UnknownAction>;

const actionsBySettingType = {
  userSettings: userSettingsActions,
  navigator: navigatorActions,
  viewerSettings: viewerSettingsActions,
} as unknown as Record<string, ActionCreatorsByName | undefined>;

// Inbound sync from the main window: apply the same action by name.
onFromMain('update-viewer-setting', (_event, setting: string) => {
  const { settingType, actionName, payload } = JSON.parse(setting) as {
    settingType: string;
    actionName: string;
    payload: unknown;
  };
  const actions = actionsBySettingType[settingType];
  if (actions && actions[actionName]) {
    viewerStore.dispatch(actions[actionName](payload));
  }
});

export default viewerStore;
