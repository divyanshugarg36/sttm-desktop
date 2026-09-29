import * as electron from 'electron';
import fs from 'fs';
import path from 'path';

import convertObjToCamelCase from '../../utils/convert-object-to-camel-case';
import userSettingsConfig from '../../../../configs/user-settings.json';
import type { SavedSettings } from './apply-user-settings';

// Also built for the main process (vite.main.config.mts), which reads the
// saved settings before any window opens.
const settings = userSettingsConfig.settings as Record<string, { initialValue?: unknown }>;

let userDataPath: string;

if (electron.app) {
  userDataPath = electron.app.getPath('userData');
} else {
  // Only in a window: the main process can't load @electron/remote.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const { app } = require('@electron/remote') as typeof import('@electron/remote');
  userDataPath = app.getPath('userData');
}

export const userConfigPath = path.join(userDataPath, 'user-data.json');

function parseDataFile(filePath: string): SavedSettings {
  // We'll try/catch it in case the file doesn't exist yet,
  // which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    // if there was some kind of error, return the passed in defaults instead.
    const defaultSettings: SavedSettings = {};
    Object.keys(settings).forEach((key) => {
      defaultSettings[key] = settings[key].initialValue;
    });
    return defaultSettings;
  }
}

export const savedSettings = parseDataFile(userConfigPath);

export const savedSettingsCamelCase = () => convertObjToCamelCase(parseDataFile(userConfigPath));
