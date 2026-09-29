import { toast } from '@khalisfoundation/sikhi-ui';
import { i18n } from '../../common/main-app';

/**
 * Whether the database is still downloading: desktop_scripts stores 'false'
 * while it downloads one the app doesn't have yet, 'true' when it had one.
 */
export const isDbDownloading = () => localStorage.getItem('isDbDownloaded') === 'false';

/** Tells the user to wait for the database. */
export const showDbDownloading = () =>
  toast.info(i18n.t('BANI.DATABASE_DOWNLOADING'), { duration: 5000 });
