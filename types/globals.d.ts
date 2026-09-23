import type { IpcRenderer } from 'electron';

// Globals the main window sets up at startup (the main window entry and the Redux
// store) and that TypeScript files read. Only what TS files use so far is
// typed; widen these as more files move to TypeScript.
declare global {
  /* eslint-disable no-var, vars-on-top */
  /** www/main/desktop_scripts.js, loaded by the Redux store. */
  var platform: { ipc: IpcRenderer; [key: string]: unknown } | undefined;
  /** Snapshot of the userSettings slice, kept current by settingsSyncMiddleware. */
  var getUserSettings: Record<string, unknown>;
  /** One setter per userSettings action, each dispatching to the store. */
  var setUserSettings: Record<string, (value: unknown) => void>;
  /* eslint-enable no-var, vars-on-top */
}

export {};
