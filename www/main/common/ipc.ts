import { ipcRenderer } from 'electron';

// Messages between the windows and the main process (app.js). Payloads mostly
// cross as JSON strings; the channel names are typed so a typo is a compile
// error.

/** Channels a window sends to the main process. */
export type MainChannel =
  | 'cast-session-active'
  | 'cast-session-stopped'
  | 'cast-to-receiver'
  | 'clear-apv'
  | 'deleteToken'
  | 'enable-wc-webview'
  | 'get-media-access-status'
  | 'presenter-view'
  | 'save-overlay-settings'
  | 'show-line'
  | 'show-misc-text'
  | 'toggle-viewer-window'
  | 'update-global-setting'
  | 'update-settings'
  | 'update-viewer-setting';

/** Channels the main process sends to a window. */
export type WindowChannel =
  | 'bani-controller-data'
  | 'cast-session-active'
  | 'cast-session-stopped'
  | 'cast-verse'
  | 'checking-for-update'
  | 'database-progress'
  | 'external-display'
  | 'get-overlay-prefs'
  | 'media-access-status'
  | 'next-ang'
  | 'presenter-view'
  | 'remove-external-display'
  | 'search-cast'
  | 'send-scroll'
  | 'set-user-setting'
  | 'stop-cast'
  | 'sync-settings'
  | 'update-available'
  | 'update-downloaded'
  | 'update-global-setting'
  | 'update-not-available'
  | 'update-viewer-setting'
  | 'userToken'
  | 'wc-webview-enabled';

export const sendToMain = (channel: MainChannel, ...args: unknown[]) =>
  ipcRenderer.send(channel, ...args);

export const onFromMain = (
  channel: WindowChannel,
  listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
) => ipcRenderer.on(channel, listener);

export const offFromMain = (
  channel: WindowChannel,
  listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void, // eslint-disable-line @typescript-eslint/no-explicit-any
) => ipcRenderer.removeListener(channel, listener);

/** The Redux slices a global setting can target (see store.ts). */
export type SettingType = 'userSettings' | 'navigator' | 'viewerSettings' | 'baniOverlay';

/**
 * Sets a setting in every window: the main process relays it to each window's
 * store, which dispatches `actionName` with `payload` on the `settingType`
 * slice.
 */
export const sendGlobalSetting = (
  actionName: string,
  payload: unknown,
  settingType: SettingType = 'userSettings',
) => sendToMain('update-global-setting', JSON.stringify({ actionName, payload, settingType }));
