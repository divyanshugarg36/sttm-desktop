/* eslint import/no-unresolved: 0, import/extensions: 0 */
// Importing the Redux store sets up global.getUserSettings/setUserSettings and
// registers the main-window IPC listeners (previously done by GlobalState).
import './js/common/store/redux/store';

global.platform = require('./js/desktop_scripts');
global.controller = require('./js/controller');
global.core = require('./js/index');

// Pull in navigator from core
global.core.menu.init();
global.platform.init();

document.body.classList.add(process.platform);
