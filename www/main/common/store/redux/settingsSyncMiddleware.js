import { USER_SETTINGS_SYNC } from './userSettingsSlice';

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

const fs = require('fs');

const settingsSyncMiddleware = (store) => (next) => (action) => {
  const meta = USER_SETTINGS_SYNC.actionMetaByType[action.type];
  if (!meta) {
    return next(action);
  }

  const { settingKey, stateVarName, schemaEntry } = meta;
  const { payload } = action;
  const oldValue = store.getState().userSettings[stateVarName];

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

  // 2. Persist to the user config file + localStorage.
  const { savedSettings, userConfigPath } = USER_SETTINGS_SYNC;
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
  if (global.controller && typeof global.controller[settingKey] === 'function') {
    global.controller[settingKey](payload);
  }

  // 6. Push font sizes to a connected WebController.
  const fontSizes = {
    gurbani: parseInt(savedSettings['gurbani-font-size'], 10),
    translation: parseInt(savedSettings['translation-font-size'], 10),
    teeka: parseInt(savedSettings['teeka-font-size'], 10),
    transliteration: parseInt(savedSettings['transliteration-font-size'], 10),
  };
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
