import { toast } from '@khalisfoundation/sikhi-ui';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';
import { isDbDownloading, showDbDownloading } from './db-downloading';

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
      if (isDbDownloading()) {
        showDbDownloading();
      } else {
        toast.error(`${i18n.t('SEARCH.ERROR')} : ${err}`, { duration: 5000 });
      }
    });
