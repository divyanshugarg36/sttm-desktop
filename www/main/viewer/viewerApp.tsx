import React from 'react';
import { Provider } from 'react-redux';
import chromecast from 'electron-chromecast';

import ShabadDeck from './ShabadDeck/ShabadDeck';
import viewerStore from './store/viewer-store';
import { castToReceiver, appendMessage, requestSession, stopApp, tingle } from './utils';
import { i18n } from '../common/main-app';
import { onFromMain } from '../common/ipc';

// The viewer entry calls ViewerApp as a function on every wc-webview-enabled,
// so the cast setup is guarded: its IPC listeners are registered once, or each
// call would add another copy and one cast-verse would cast several times.
let castSetUp = false;

const setUpCast = () => {
  if (castSetUp) {
    return;
  }
  castSetUp = true;

  chromecast(
    (receivers) =>
      new Promise<ChromecastReceiver>((resolve) => {
        const modal = new tingle.Modal({
          footer: true,
          stickyFooter: false,
          closeMethods: ['overlay', 'button', 'escape'],
        });

        receivers.forEach((receiver) => {
          const fullName = receiver.service_fullname;
          const blacklist = ['Chromecast-Audio', 'Google-Home', 'Sound-Bar', 'Google-Cast-Group'];
          if (receiver.friendlyName && !new RegExp(blacklist.join('|')).test(fullName)) {
            modal.addCastBtn(
              receiver.friendlyName,
              'tingle-btn tingle-btn--primary',
              `${receiver.ipAddress}_${receiver.port}`,
              (e: MouseEvent) => {
                if (
                  (e.target as HTMLElement).getAttribute('data-reciever-id') ===
                  `${receiver.ipAddress}_${receiver.port}`
                ) {
                  resolve(receiver);
                }
                modal.close();
              },
            );
          }
        });
        // set content
        const message =
          receivers.length === 0
            ? i18n.t(`CHROMECAST.NO_DEVICES_FOUND`)
            : i18n.t('CHROMECAST.SELECT_DEVICE');
        modal.setContent(`<h2 class='tingle-heading'>${message}</h2>`);
        // add cancel button
        const cancelTitle = receivers.length === 0 ? 'OK' : i18n.t('CHROMECAST.CANCEL');
        modal.addFooterBtn(
          cancelTitle,
          'tingle-btn tingle-btn--pull-right tingle-btn--default',
          () => {
            modal.close();
          },
        );
        modal.open();
      }),
  );

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
    </Provider>
  );
};

export default ViewerApp;
