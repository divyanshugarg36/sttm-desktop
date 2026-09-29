import { toast } from '@khalisfoundation/sikhi-ui';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';

// sourceId defaults to Guru Granth Sahib.
export const loadAng = (angNo: number | string, sourceId?: string) =>
  banidb
    .loadAng(angNo, sourceId)
    .then((verses) => verses)
    .catch((err) => {
      toast.error(`${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Ang' })} : ${err}`, {
        duration: 5000,
      });
    });
