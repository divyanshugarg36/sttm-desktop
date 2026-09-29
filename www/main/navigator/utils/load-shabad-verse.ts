import { toast } from '@khalisfoundation/sikhi-ui';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';

export const loadShabadVerse = (shabadID: number | string, lineID: number, nextLine = false) =>
  banidb
    .loadShabad(shabadID)
    .then((rows) =>
      rows.filter((verse) => {
        if (nextLine) {
          return verse.ID === lineID + 1;
        }
        return verse.ID === lineID;
      }),
    )
    .catch((err) => {
      toast.error(`${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Shabad verse' })} : ${err}`, {
        duration: 5000,
      });
    });
