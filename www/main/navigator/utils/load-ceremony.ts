import Noty from 'noty';
import * as banidb from '../../banidb';
import { i18n } from '../../common/main-app';
import type { CeremonyRow, LoadedLine } from './types';

export const loadCeremony = (ceremonyId: number | string) =>
  banidb
    .loadCeremony(ceremonyId)
    .then((result) =>
      result
        .map((rowDb) => {
          // A line with neither a verse nor a custom line stays the ceremony row.
          let row: CeremonyRow = rowDb as unknown as LoadedLine;

          if (rowDb.Verse) {
            row = rowDb.Verse;
          }

          if (rowDb.Custom && rowDb.Custom.ID) {
            row = rowDb.Custom;
          }

          row.shabadID = `ceremony-${rowDb.Ceremony.Token}`;
          row.ceremonyName = rowDb.Ceremony.Gurmukhi;
          row.ceremonyId = rowDb.Ceremony.ID;

          if (rowDb.VerseRange && rowDb.VerseRange.length) {
            row = [...rowDb.VerseRange];
          }

          row.sessionKey = `ceremony-${ceremonyId}`;
          return row;
        })
        .filter((verse) => {
          if (verse) {
            return true;
          }
          return false;
        }),
    )
    .catch((err) => {
      new Noty({
        type: 'error',
        text: `${i18n.t('BANI.LOAD_ERROR', { erroneousOperation: 'Ceremony' })} : ${err}`,
        timeout: 5000,
        modal: true,
      }).show();
    });
