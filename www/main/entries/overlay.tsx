// Overlay window entry (www/overlay.html).
import { createRoot } from 'react-dom/client';

import app from '../overlay/app';
import { savedSettings } from '../common/store/user-settings/get-saved-user-settings';
import { syncSikhiUiTheme } from '../common/sui-theme';

// The app theme's class on <body>, as the main window has it, so sikhi-ui's
// light or dark theme follows it (sui-theme reads it from the class).
const applyTheme = (theme: unknown) => {
  document.body.classList.forEach((name) => {
    if (name.startsWith('theme-')) document.body.classList.remove(name);
  });
  if (typeof theme === 'string') document.body.classList.add(`theme-${theme}`);
};

applyTheme(savedSettings.theme);
syncSikhiUiTheme();

// The main window saves the settings to localStorage on every change, which
// reaches this window as a storage event: follow a theme change live.
window.addEventListener('storage', (event) => {
  if (event.key !== 'userSettings' || !event.newValue) return;
  try {
    applyTheme((JSON.parse(event.newValue) as { theme?: unknown }).theme);
  } catch {
    // Not JSON: keep the current theme.
  }
});

const root = createRoot(document.getElementById('overlay-container')!);
root.render(app());
