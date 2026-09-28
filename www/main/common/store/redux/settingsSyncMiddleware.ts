import fs from 'fs';
import type { Middleware, PayloadAction } from '@reduxjs/toolkit';

import { USER_SETTINGS_SYNC } from './userSettingsSlice';
import { NAVIGATOR_SYNC } from './navigatorSlice';
import { BANI_OVERLAY_SYNC } from './baniOverlaySlice';
import { savedOverlaySettings } from '../user-settings/get-saved-overlay-settings';
import { userConfigPath } from '../user-settings/get-saved-user-settings';
import type { RootState } from './store';

// Redux middleware that runs the side effects the easy-peasy settings actions
// used to embed inside their reducers (see the old create-user-settings-state).
// Reducers are now pure; this centralizes: IPC broadcast to the viewer window,
// persistence (config file + localStorage), the `global.getUserSettings` mirror,
// the `document.body` class swap, the `global.controller` callback, and the
// WebController socket emit. See EASY-PEASY-TO-REDUX-MIGRATION.md.
//
// No echo guard is needed: only the viewer-window components send
// `update-global-setting`; the main window re-broadcasting `update-viewer-setting`
// on an inbound change just refreshes the viewer's shadow and terminates
// (the viewer's listener only sets state, it never re-sends) — the exact
// behavior the old GlobalState inbound listener already had.

// Every action here is a slice's setter: `slice/setX` with its payload.
const settingsSyncMiddleware: Middleware<object, RootState> = (store) => (next) => (rawAction) => {
  const action = rawAction as PayloadAction<unknown>;
  // baniOverlay (main window): persist to the user config file and notify the
  // main process via `save-overlay-settings` (was create-overlay-settings-state).
  const overlayMeta = BANI_OVERLAY_SYNC.actionMetaByType[action.type];
  if (overlayMeta) {
    const result = next(action);
    savedOverlaySettings.baniOverlay[overlayMeta.settingKey] = action.payload;
    fs.writeFileSync(userConfigPath, JSON.stringify(savedOverlaySettings));
    if (global.platform) {
      global.platform.ipc.send(
        'save-overlay-settings',
        JSON.stringify(store.getState().baniOverlay),
      );
    }
    return result;
  }

  // viewerSettings (main window): broadcast to the viewer window's shadow store.
  if (action.type.startsWith('viewerSettings/')) {
    const result = next(action);
    const message = JSON.stringify({
      payload: action.payload,
      actionName: action.type.split('/')[1],
      settingType: 'viewerSettings',
    });
    if (global.webview) {
      global.webview.send('update-viewer-setting', message);
    }
    if (global.platform) {
      global.platform.ipc.send('update-viewer-setting', message);
    }
    return result;
  }

  // navigator: the only side effect is broadcasting the change to the viewer
  // window's shadow store (no persistence / DOM / socket).
  const navMeta = NAVIGATOR_SYNC.actionMetaByType[action.type];
  if (navMeta) {
    const { stateVarName } = navMeta;
    const oldValue: unknown = store.getState().navigator[stateVarName];
    const result = next(action);
    const message = JSON.stringify({
      stateName: stateVarName,
      payload: action.payload,
      oldValue,
      actionName: action.type.split('/')[1],
      settingType: 'navigator',
    });
    if (global.webview) {
      global.webview.send('update-viewer-setting', message);
    }
    if (global.platform) {
      global.platform.ipc.send('update-viewer-setting', message);
    }
    return result;
  }

  const meta = USER_SETTINGS_SYNC.actionMetaByType[action.type];
  if (!meta) {
    return next(action);
  }

  const { settingKey, stateVarName, schemaEntry } = meta;
  const { payload } = action;
  const oldValue: unknown = store.getState().userSettings[stateVarName];

  // Apply the pure reducer first so getState() below is current.
  const result = next(action);

  const actionName = action.type.split('/')[1];
  const message = JSON.stringify({
    stateName: stateVarName,
    payload,
    oldValue,
    actionName,
    settingType: 'userSettings',
  });

  // 1. IPC broadcast → viewer window (keeps its shadow store in sync).
  if (global.webview) {
    global.webview.send('update-viewer-setting', message);
  }
  if (global.platform) {
    global.platform.ipc.send('update-viewer-setting', message);
  }

  // 2. Persist to the user config file + localStorage. `userConfigPath` is the
  // module-level import (same value USER_SETTINGS_SYNC re-exports); destructuring
  // it here would shadow that import and put the baniOverlay branch's use above in
  // the temporal dead zone.
  const { savedSettings } = USER_SETTINGS_SYNC;
  savedSettings[settingKey] = payload;
  fs.writeFileSync(userConfigPath, JSON.stringify(savedSettings));
  if (typeof localStorage === 'object') {
    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
  }

  // 3. Mirror onto the global object other code reads synchronously.
  if (global.getUserSettings) {
    global.getUserSettings[stateVarName] = payload;
  }

  // 4. DOM class swap (drives theming), unless the setting opts out.
  if (typeof document !== 'undefined' && document && !schemaEntry.dontApplyClass) {
    document.body.classList.remove(`${settingKey}-${oldValue}`);
    document.body.classList.add(`${settingKey}-${payload}`);
  }

  // 5. Side-effect callback registered on the global controller.
  const controllerCallback = (
    global.controller as unknown as Record<string, unknown> | undefined
  )?.[settingKey];
  if (typeof controllerCallback === 'function') {
    controllerCallback(payload);
  }

  // 6. Push font sizes to a connected WebController: Gurbani's, and each of
  // translation / teeka / transliteration from whichever content line shows it
  // (left out when none does, so the controller keeps what it had).
  const fontSize = (key: string) => parseInt(String(savedSettings[key]), 10);
  const fontSizes: Record<string, number> = { gurbani: fontSize('gurbani-font-size') };
  (['translation', 'teeka', 'transliteration'] as const).forEach((kind) => {
    const line = [1, 2, 3].find((n) => String(savedSettings[`content${n}`]).startsWith(kind));
    if (line) {
      fontSizes[kind] = fontSize(`content${line}-font-size`);
    }
  });
  if (typeof window !== 'undefined' && window.socket !== undefined && window.socket !== null) {
    window.socket.emit('data', {
      host: 'sttm-desktop',
      type: 'settings',
      settings: { fontSizes },
    });
  }

  return result;
};

export default settingsSyncMiddleware;
