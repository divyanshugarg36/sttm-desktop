import Noty from 'noty';
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
        new Noty({
          type: 'error',
          text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Shabad' })} : ${err}`,
          timeout: 5000,
          modal: true,
        }).show();
      }
    });
