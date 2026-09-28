import type { WebviewTag } from 'electron';

import type platformModule from '../www/main/desktop_scripts';
import type controllerModule from '../www/main/controller';
import type coreModule from '../www/main/index';

/**
 * The bani controller's socket.io connection. The client is the script the
 * sync server serves (window.io), so only what the app calls is declared.
 */
interface ControllerSocket {
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, listener: (...args: any[]) => void) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  disconnect: () => void;
}

/** A display's size in pixels (the viewer window's, or an external display's). */
interface DisplaySize {
  width: number;
  height: number;
}

// Globals the windows set up at startup and read from any module (the main
// window entry, the Redux store, the viewer / overlay stores).
declare global {
  /* eslint-disable no-var, vars-on-top */
  /** www/main/desktop_scripts.js: IPC, the offline database, settings sync. */
  var platform: typeof platformModule;
  /** www/main/controller.js: the app menu and window-level settings handlers. */
  var controller: typeof controllerModule;
  /** www/main/index.js: the menu, the theme editor and platformMethod(). */
  var core: typeof coreModule;
  /** The embedded viewer <webview> in the main window, while it's mounted. */
  var webview: WebviewTag | null;
  /** The viewer's size, for scaling the embedded preview (ScaleViewer). */
  var viewer: DisplaySize;
  /** The external display the viewer window is on, when there is one. */
  var externalDisplay: DisplaySize | undefined;
  /** Snapshot of the userSettings slice, kept current by settingsSyncMiddleware. */
  var getUserSettings: Record<string, unknown>;
  /** One setter per userSettings action, each dispatching to the store. */
  var setUserSettings: Record<string, (value: unknown) => void>;
  /* eslint-enable no-var, vars-on-top */

  interface Window {
    /** The bani controller's socket.io connection (bani-controller addon). */
    socket?: ControllerSocket | null;
    /** The controller's socket.io namespace (the sync code). */
    namespaceString?: string;
    /** The socket.io client script the sync server serves. */
    io?: (url: string) => ControllerSocket;
    /** Safari's prefixed AudioContext. */
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
