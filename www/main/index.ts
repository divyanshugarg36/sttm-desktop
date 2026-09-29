import menu from './menu';
import themeEditor from './theme_editor';
import settings from './settings';
import type platformModule from './desktop_scripts';

type Platform = typeof platformModule;

/** The platform's methods (the keys platformMethod() can call). */
type PlatformMethod = {
  [K in keyof Platform]: Platform[K] extends (...args: never[]) => unknown ? K : never;
}[keyof Platform];

/**
 * Check if the platform has a method and call if it is does
 *
 * @since 3.2.2
 * @param method Name of the platform method
 * @param args Arguments to be passed to the method
 * @example
 *
 * global.core.platformMethod('updateSettings');
 */
function platformMethod(method: PlatformMethod, args?: unknown) {
  if (typeof global.platform[method] === 'function') {
    (global.platform[method] as (arg: unknown) => void).call(global.platform, args);
  }
}

global.platform.ipc.on('sync-settings', () => {
  settings.init();
});
const core = {
  menu,
  platformMethod,
  themeEditor,
};

export default core;
