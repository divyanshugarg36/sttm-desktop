// What the main process (app.js) shares with the windows, reached through
// @electron/remote: its i18n instance, the preferences store, the theme list
// and a few app helpers, plus the analytics global. Import from here instead of
// calling remote.require('./app') in every module.
import * as remote from '@electron/remote';
import type { i18n as I18n } from 'i18next';

import type themesJson from '../../configs/themes.json';

/** A theme from www/configs/themes.json. */
export type Theme = (typeof themesJson)[number] & {
  'background-video'?: string;
  'background-video-poster'?: string;
};

/** The preferences store (www/main/store.ts), a JSON file under userData. */
export interface PreferencesStore {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  delete(key: string): void;
  getDefaults(): Record<string, unknown>;
  getAllPrefs(): Record<string, unknown>;
  getUserPref(key: string): unknown;
  setUserPref(key: string, value: unknown): void;
}

interface MainApp {
  i18n: I18n;
  store: PreferencesStore;
  themes: Theme[];
  appVersion: string;
  /** Set when app.js is built for an app store (hides the updater). */
  appstore: boolean;
  /** Windows releases older than 8.1, which some features don't support. */
  isUnsupportedWindow: boolean;
  openSecondaryWindow: (windowName: string) => void;
  checkForUpdates: (manual?: boolean) => void;
  autoUpdater: { quitAndInstall: () => void };
}

/** analytics.js (main process): events go to Aptabase when online. */
export interface Analytics {
  trackEvent: (event: {
    category?: string;
    action: string;
    label?: unknown;
    value?: unknown;
  }) => void;
}

export const mainApp = remote.require('./app') as MainApp;

export const { i18n, store, themes } = mainApp;

export const analytics = remote.getGlobal('analytics') as Analytics;
