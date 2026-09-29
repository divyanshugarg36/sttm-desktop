import { toast } from '@khalisfoundation/sikhi-ui';
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
    toast.success(i18n.t('SHORTCUT.COPY_TO_CLIPBOARD'), { duration: 2000 });
  }
};
