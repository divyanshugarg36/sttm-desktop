// Main window entry (www/index.html). Replaces the inline React bootstrap and
// the classic <script src="js/desktop_index.js">, in the same order: render the
// app, then set up the globals and start the menu / platform.
import { createRoot } from 'react-dom/client';

import app from '../app';
import platform from '../desktop_scripts';
import controller from '../controller';
import core from '../index';

const root = createRoot(document.getElementById('navigator'));
root.render(app());

global.platform = platform;
global.controller = controller;
global.core = core;

global.core.menu.init();
global.platform.init();

document.body.classList.add(process.platform);
