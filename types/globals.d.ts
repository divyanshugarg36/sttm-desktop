import type { WebviewTag } from 'electron';

import type platformModule from '../www/main/desktop_scripts';
import type controllerModule from '../www/main/controller';
import type coreModule from '../www/main/index';
import type {
  ControllerSocketData,
  DesktopMessage,
} from '../www/main/addons/bani-controller/types';

/**
 * The bani controller's socket.io connection. The client is the script the
 * sync server serves (window.io), so only what the app calls is declared.
 */
interface ControllerSocket {
  emit: (event: 'data', message: DesktopMessage) => void;
  /** The payloads arrive unvalidated; see ControllerMessage. */
  on: (event: 'data', listener: (data: ControllerSocketData) => void) => void;
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
  /** www/main/desktop_scripts.ts: IPC, the offline database, settings sync. */
  var platform: typeof platformModule;
  /** www/main/controller.ts: the app menu and window-level settings handlers. */
  var controller: typeof controllerModule;
  /** www/main/index.ts: the menu, the theme editor and platformMethod(). */
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
    /** The controller's socket.io namespace (the sync code); null once sync ends. */
    namespaceString?: string | null;
    /** The socket.io client script the sync server serves. */
    io?: (url: string) => ControllerSocket;
    /** Safari's prefixed AudioContext. */
    webkitAudioContext?: typeof AudioContext;
  }
}

export {};
