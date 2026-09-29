// Viewer window entry (www/viewer.html). The viewer app is only loaded and
// rendered once the main process enables it, as before.
import { ipcRenderer } from 'electron';
import { createRoot, type Root } from 'react-dom/client';
import { syncSikhiUiTheme } from '../common/sui-theme';

let root: Root | null = null;

syncSikhiUiTheme();

ipcRenderer.on('wc-webview-enabled', async () => {
  const { default: app } = await import('../viewer/viewerApp');

  if (!root) {
    root = createRoot(document.getElementById('viewer-container')!);
  }
  root.render(app());
});
