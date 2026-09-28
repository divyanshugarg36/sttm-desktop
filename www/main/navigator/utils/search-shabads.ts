import Noty from 'noty';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';

export const searchShabads = (
  searchQuery: string,
  searchType: number,
  searchSource: string,
  howManyRows?: number,
) =>
  banidb
    .query(searchQuery, searchType, searchSource, howManyRows)
    .then((verses) => verses)
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
          text: `${i18n.t('SEARCH.ERROR')} : ${err}`,
          timeout: 5000,
          modal: true,
        }).show();
      }
    });
