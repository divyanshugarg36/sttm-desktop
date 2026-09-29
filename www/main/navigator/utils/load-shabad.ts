import Noty from 'noty';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';

export const loadShabad = (shabadID: number | string) =>
  banidb
    .loadShabad(shabadID)
    .then((rows) => rows)
    .catch((err) => {
      const dbStatus = !!localStorage.getItem('isDbDownloaded');
      if (dbStatus) {
        new Noty({
          type: 'error',
          text: `${i18n.t('BANI.DATABASE_DOWNLOADING')}`,
          timeout: 5000,
          modal: true,
        }).show();
      } else {
        new Noty({
          type: 'error',
          text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Shabad' })} : ${err}`,
          timeout: 5000,
          modal: true,
        }).show();
      }
    });
