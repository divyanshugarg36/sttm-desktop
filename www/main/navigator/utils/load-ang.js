import Noty from 'noty';
import * as banidb from '../../banidb';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

// sourceId defaults to Guru Granth Sahib.
export const loadAng = (angNo, sourceId) =>
  banidb
    .loadAng(angNo, sourceId)
    .then((verses) => verses)
    .catch((err) => {
      new Noty({
        type: 'error',
        text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Ang' })} : ${err}`,
        timeout: 5000,
        modal: true,
      }).show();
    });
