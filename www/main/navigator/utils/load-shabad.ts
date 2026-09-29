import { toast } from '@khalisfoundation/sikhi-ui';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';
import { isDbDownloading, showDbDownloading } from './db-downloading';

export const loadShabad = (shabadID: number | string) =>
  banidb
    .loadShabad(shabadID)
    .then((rows) => rows)
    .catch((err) => {
      if (isDbDownloading()) {
        showDbDownloading();
      } else {
        toast.error(`${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Shabad' })} : ${err}`, {
          duration: 5000,
        });
      }
    });
