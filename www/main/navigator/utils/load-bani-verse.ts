import Noty from 'noty';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';
import type { LoadedLine } from './types';

export const loadBaniVerse = (
  baniId: number | string,
  verseId: number,
  baniLength: string,
  nextLine = false,
) =>
  // mangalPosition was removed from arguments and filter
  // mangalPosition = 'current',
  // .filter(result => result.MangalPosition !== mangalPosition)
  banidb
    .loadBani(baniId, baniLength)
    .then((allVerses) =>
      allVerses
        .filter((rowDb) => rowDb.MangalPosition !== 'above')
        .map((rowDb) => {
          // A line with neither a verse nor a custom line stays the bani row.
          let row = rowDb as unknown as LoadedLine;
          if (rowDb.Verse) {
            row = rowDb.Verse;
          }
          if (rowDb.Custom) {
            row = rowDb.Custom;
            row.shabadID = rowDb.Bani.Token;
          }
          row.crossPlatformID = rowDb.ID;
          return row;
        })
        .filter((verse) => {
          if (verse !== null) {
            const id = verse.ID;
            if (nextLine) {
              return id === verseId + 1;
            }
            return id === verseId;
          }
          return false;
        }),
    )
    .catch((err) => {
      new Noty({
        type: 'error',
        text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Bani verse' })} : ${err}`,
        timeout: 5000,
        modal: true,
      }).show();
    });
