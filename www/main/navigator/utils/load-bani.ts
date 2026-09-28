import Noty from 'noty';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';
import type { LoadedLine } from './types';

export const loadBani = (baniId: number | string, baniLength: string) =>
  // mangalPosition was removed from arguments and filter
  // .filter(result => result.MangalPosition !== mangalPosition)
  // mangalPosition
  banidb
    .loadBani(baniId, baniLength)
    .then((rows) =>
      rows
        .filter((rowDb) => rowDb.MangalPosition !== 'above')
        .map((rowDb) => {
          // A line with neither a verse nor a custom line stays the bani row.
          let row = rowDb as unknown as LoadedLine;
          if (rowDb.Verse) {
            row = rowDb.Verse;
          }
          if (rowDb.Custom) {
            row = rowDb.Custom;
          }

          row.shabadID = rowDb.Bani.Token;
          row.baniId = rowDb.Bani.ID;
          row.baniName = rowDb.Bani.Gurmukhi;
          row.crossPlatformID = rowDb.ID;
          return row;
        })
        .filter((row) => row),
    )
    .catch((err) => {
      new Noty({
        type: 'error',
        text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Bani' })} : ${err}`,
        timeout: 5000,
        modal: true,
      }).show();
    });
