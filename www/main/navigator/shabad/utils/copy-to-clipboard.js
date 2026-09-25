import Noty from 'noty';
import copy from 'copy-to-clipboard';

const anvaad = require('anvaad-js');
const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

export const copyToClipboard = (activeVerseRef) => {
  if (activeVerseRef && activeVerseRef.current) {
    // The Gurbani Akhar text in the verse row's sikhi-ui BaaniLine.
    const nonUniCodePanktee =
      activeVerseRef.current.querySelector('.sui-gurbani-display')?.innerText || '';
    const uniCodePanktee = anvaad.unicode(nonUniCodePanktee);
    copy(uniCodePanktee);
    new Noty({
      type: 'info',
      text: `${i18n.t('SHORTCUT.COPY_TO_CLIPBOARD')}`,
      timeout: 2000,
    }).show();
  }
};
