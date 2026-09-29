import Noty from 'noty';
import copy from 'copy-to-clipboard';
import anvaad from 'anvaad-js';
import { i18n } from '../../../common/main-app';

export const copyToClipboard = (activeVerseRef: React.RefObject<HTMLDivElement>) => {
  if (activeVerseRef && activeVerseRef.current) {
    // The Gurbani Akhar text in the verse row's sikhi-ui BaaniLine.
    const nonUniCodePanktee =
      activeVerseRef.current.querySelector<HTMLElement>('.sui-gurbani-display')?.innerText || '';
    const uniCodePanktee = anvaad.unicode(nonUniCodePanktee);
    copy(uniCodePanktee);
    new Noty({
      type: 'info',
      text: `${i18n.t('SHORTCUT.COPY_TO_CLIPBOARD')}`,
      timeout: 2000,
    }).show();
  }
};
