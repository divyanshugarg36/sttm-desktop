/* eslint import/no-unresolved: 0, import/extensions: 0 */
// Importing the Redux store sets up global.getUserSettings/setUserSettings and
// registers the main-window IPC listeners (previously done by GlobalState).
import './js/common/store/redux/store';
import platform from './js/desktop_scripts';
import controller from './js/controller';
import core from './js/index';

global.platform = platform;
global.controller = controller;
global.core = core;

// Pull in navigator from core
global.core.menu.init();
global.platform.init();

document.body.classList.add(process.platform);
