import React from 'react';
import { Provider } from 'react-redux';

import ShabadDeck from './ShabadDeck/ShabadDeck';
import viewerStore from './store/viewer-store';
import { castToReceiver, appendMessage, requestSession, stopApp } from './utils';
import { CastDevicePicker, pickCastDevice } from './CastDevicePicker';
import { onFromMain } from '../common/ipc';

// Required, not imported: an import makes the Vite dev server load the
// package in its own Node process to build a shim, which starts its mDNS
// discovery there, and a malformed reply then crashes the dev server.
// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const chromecast = require('electron-chromecast') as typeof import('electron-chromecast').default;

// The viewer entry calls ViewerApp as a function on every wc-webview-enabled,
// so the cast setup is guarded: its IPC listeners are registered once, or each
// call would add another copy and one cast-verse would cast several times.
let castSetUp = false;

const setUpCast = () => {
  if (castSetUp) {
    return;
  }
  castSetUp = true;

  chromecast(pickCastDevice);

  onFromMain('search-cast', (event, pos) => {
    requestSession();
    appendMessage(event);
    appendMessage(pos);
  });

  onFromMain('stop-cast', () => {
    stopApp();
  });

  onFromMain('cast-verse', () => {
    castToReceiver();
  });
};

const ViewerApp = () => {
  setUpCast();
  return (
    <Provider store={viewerStore}>
      <ShabadDeck />
      <CastDevicePicker />
    </Provider>
  );
};

export default ViewerApp;
