import * as electron from 'electron';
import fs from 'fs';
import ldDefaultsDeep from 'lodash.defaultsdeep';
import ldGet from 'lodash.get';
import path from 'path';

import type { PreferencesStore } from './common/main-app';

// The preferences store. Built for the main process (vite.main.config.mts):
// app.js requires dist/main/store and creates the one instance, which the
// windows reach through @electron/remote (common/main-app).

type Data = Record<string, unknown>;

interface StoreOptions {
  /** The file name under userData, without `.json`. */
  configName: string;
  defaults: Data;
}

// Set a value at a dot-separated path such as 'userPrefs.app.theme', creating
// objects along the way (what lodash.set did for these keys). Refuses keys that
// would reach Object.prototype.
const UNSAFE_KEYS = ['__proto__', 'constructor', 'prototype'];
function setByPath(target: Data, keyPath: string, value: unknown) {
  const keys = String(keyPath).split('.');
  if (keys.some((key) => UNSAFE_KEYS.includes(key))) {
    return;
  }
  const lastKey = keys.pop()!;
  let node = target;
  keys.forEach((key) => {
    if (node[key] === null || typeof node[key] !== 'object') {
      node[key] = {};
    }
    node = node[key] as Data;
  });
  node[lastKey] = value;
}

function parseDataFile(filePath: string, defaults: Data): Data {
  // We'll try/catch it in case the file doesn't exist yet,
  // which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults;
  }
}

class Store implements PreferencesStore {
  path: string;

  data: Data;

  defaults: Data;

  combined: Data;

  constructor(opts: StoreOptions) {
    // Renderer process has to get `app` module via `remote`,
    // whereas the main process can get it directly
    // app.getPath('userData') will return a string of the user's app data directory path.
    let userDataPath: string;
    if (electron.app) {
      userDataPath = electron.app.getPath('userData');
    } else {
      // Only in a window: the main process can't load @electron/remote.
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      const remote = require('@electron/remote') as typeof import('@electron/remote');
      userDataPath = remote.app.getPath('userData');
    }

    // We'll use the `configName` property to set the file name and path.join
    // to bring it all together as a string
    this.path = path.join(userDataPath, `${opts.configName}.json`);

    this.data = parseDataFile(this.path, opts.defaults);
    this.defaults = opts.defaults;

    // Write preferences to localStorage for viewers
    this.combined = ldDefaultsDeep(this.data, this.defaults);
    if (typeof localStorage === 'object') {
      localStorage.setItem('prefs', JSON.stringify(this.combined.userPrefs));
    }
  }

  // This will return the default values
  getDefaults() {
    return this.defaults;
  }

  // This will just return the property on the `data` object
  get(key: string): unknown {
    return ldGet(this.combined, key);
  }

  // ...and this will set it
  set(key: string, val: unknown) {
    setByPath(this.data, key, val);
    this.combined = ldDefaultsDeep(this.data, this.defaults);

    // Wait, I thought using the node.js' synchronous APIs was bad form?
    // We're not writing a server so there's not nearly the same IO demand on the process
    // Also if we used an async API and our app was quit
    // before the asynchronous write had a chance to complete,
    // we might lose that data. Note that in a real app, we would try/catch this.
    fs.writeFileSync(this.path, JSON.stringify(this.data));

    // Update localStorage for viewer
    if (typeof localStorage === 'object') {
      localStorage.setItem('prefs', JSON.stringify(this.combined.userPrefs));
    }
  }

  delete(key: string) {
    delete this.data[key];
    this.combined = ldDefaultsDeep(this.data, this.defaults);

    fs.writeFileSync(this.path, JSON.stringify(this.data));

    // Update localStorage for viewer
    if (typeof localStorage === 'object') {
      localStorage.setItem('prefs', JSON.stringify(this.combined.userPrefs));
    }
  }

  getAllPrefs() {
    return this.get('userPrefs') as Data;
  }

  getUserPref(key: string) {
    return this.get(`userPrefs.${key}`);
  }

  setUserPref(key: string, val: unknown) {
    this.set(`userPrefs.${key}`, val);
  }
}

// expose the class. It is the only export, so the CommonJS build sets
// module.exports to it, which is what app.js requires.
export default Store;
