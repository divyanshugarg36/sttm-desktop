/* eslint-disable global-require */
// The BaniDB functions, read from the SQLite BaniDB through
// @khalisfoundation/banidb. Each returns the rows the app was written for when
// it used Realm (Verse rows with Gurmukhi, Translations / Visraam as JSON
// strings, Source, Shabads, …), so the code reading them is unchanged. As with
// Realm, a lookup that finds nothing leaves its promise pending.
import { DatabaseSync } from 'node:sqlite';
import { createBaniDB } from '@khalisfoundation/banidb';
import * as CONSTS from './constants';

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const userDataPath = electron.app
  ? electron.app.getPath('userData')
  : require('@electron/remote').app.getPath('userData');

/** STTM_BANIDB_SQLITE points at a local file (development); else the downloaded one. */
export const sqlitePath =
  process.env.STTM_BANIDB_SQLITE || path.resolve(userDataPath, 'banidb.sqlite');

export const hasSqliteDB = () => fs.existsSync(sqlitePath) && fs.statSync(sqlitePath).size > 0;

const WAIT_FOR_DB_MS = 1000;

let client;
let database;

/** The open database. On first launch it waits for the download to finish. */
const openDatabase = async () => {
  while (!hasSqliteDB()) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, WAIT_FOR_DB_MS);
    });
  }
  if (!database) {
    database = new DatabaseSync(sqlitePath, { readOnly: true });
  }
  return database;
};

const banidb = () => {
  if (!client) {
    client = createBaniDB({
      db: { query: async (sql, params = []) => (await openDatabase()).prepare(sql).all(...params) },
    });
  }
  return client;
};

/** Reopen the file on next use, e.g. after a newer database replaced it. */
export const reopen = () => {
  if (database) {
    database.close();
  }
  database = null;
  client = null;
};

// --- Realm-shaped rows -------------------------------------------------------

/** Realm objects have a toJSON() that returns a plain copy; the app calls it. */
const realmObject = (fields) =>
  Object.defineProperty(fields, 'toJSON', {
    value() {
      return { ...this };
    },
  });

/** The package's parsed translations back to the DB's JSON (Punjabi split into pu / puu). */
const toTranslationsJSON = (translation = {}) => {
  const pu = {};
  const puu = {};
  Object.entries(translation.pu || {}).forEach(([key, value]) => {
    pu[key] = value.gurmukhi;
    puu[key] = value.unicode;
  });
  return JSON.stringify({
    en: translation.en || {},
    pu,
    puu,
    es: translation.es || {},
    hi: translation.hi || {},
  });
};

const toSource = (source) =>
  source && source.sourceId
    ? realmObject({
        SourceID: source.sourceId,
        SourceGurmukhi: source.gurmukhi,
        SourceUnicode: source.unicode,
        SourceEnglish: source.english,
      })
    : null;

const toWriter = (writer) =>
  writer && writer.writerId !== null && writer.writerId !== undefined
    ? realmObject({
        WriterID: writer.writerId,
        WriterEnglish: writer.english,
        WriterGurmukhi: writer.gurmukhi,
        WriterUnicode: writer.unicode,
      })
    : null;

const toRaag = (raag) =>
  raag && raag.raagId !== null && raag.raagId !== undefined
    ? realmObject({
        RaagID: raag.raagId,
        RaagGurmukhi: raag.gurmukhi,
        RaagUnicode: raag.unicode,
        RaagEnglish: raag.english,
        RaagWithPage: raag.raagWithPage,
      })
    : null;

/** A Realm `Verse`, from the package's verse (and, for lines without meta, their shabad's). */
const toVerseRow = (verse, { id = verse.verseId, shabadId = verse.shabadId, meta = verse } = {}) =>
  realmObject({
    ID: id,
    Gurmukhi: verse.verse.gurmukhi,
    Translations: toTranslationsJSON(verse.translation),
    // Realm had null where the DB has no visraam data (the package gives {}).
    Visraam:
      verse.visraam && Object.keys(verse.visraam).length ? JSON.stringify(verse.visraam) : null,
    PageNo: verse.pageNo,
    LineNo: verse.lineNo,
    Updated: verse.updated,
    Source: toSource(meta.source),
    Writer: toWriter(meta.writer),
    Raag: toRaag(meta.raag),
    Shabads: shabadId ? [realmObject({ ShabadID: shabadId })] : [],
  });

/** Resolve with the rows, or stay pending when there are none (as the Realm lookups do). */
const resolveRows = (resolve) => (rows) => {
  if (rows && rows.length > 0) {
    resolve(rows);
  }
};

// --- search ------------------------------------------------------------------

/** Desktop's search types → the package's (desktop's ang search is 4, the API's 5). */
const SEARCH_TYPE = {
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS]: 0,
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS_ANYWHERE]: 1,
  [CONSTS.SEARCH_TYPES.GURMUKHI_WORD]: 2,
  [CONSTS.SEARCH_TYPES.ENGLISH_WORD]: 3,
  [CONSTS.SEARCH_TYPES.ANG]: 5,
  [CONSTS.SEARCH_TYPES.MAIN_LETTERS]: 6,
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS_ENGLISH]: 7,
};

const query = (searchQuery, searchType, searchSource, resultRows = 20) => {
  const isAng = searchType === CONSTS.SEARCH_TYPES.ANG;
  // Angs are numbered per source: an ang search reads the Source filter, or
  // Guru Granth Sahib when it is "all".
  const source =
    isAng && searchSource === CONSTS.SOURCE_TYPES.ALL_SOURCES
      ? CONSTS.SOURCE_TYPES.GURU_GRANTH_SAHIB
      : searchSource;
  return banidb()
    .search(searchQuery.trim(), {
      type: SEARCH_TYPE[searchType],
      source: source === CONSTS.SOURCE_TYPES.ALL_SOURCES ? null : source,
      results: isAng ? 1000 : resultRows,
    })
    .then(({ verses }) => verses.map((verse) => toVerseRow(verse)));
};

// --- shabads and angs ----------------------------------------------------------

const loadShabad = (ShabadID) =>
  new Promise((resolve, reject) => {
    banidb()
      .getShabad(ShabadID)
      .then((shabad) =>
        (shabad ? shabad.verses : []).map((verse) =>
          toVerseRow(verse, { meta: shabad.shabadInfo }),
        ),
      )
      .then(resolveRows(resolve))
      .catch(reject);
  });

/** The ang and source a shabad starts on. */
const getAng = (ShabadID) =>
  new Promise((resolve, reject) => {
    banidb()
      .getShabad(ShabadID)
      .then((shabad) => {
        if (shabad) {
          resolve({
            PageNo: shabad.shabadInfo.pageNo,
            SourceID: shabad.shabadInfo.source.sourceId,
          });
        }
      })
      .catch(reject);
  });

const loadAng = (PageNo, SourceID = CONSTS.SOURCE_TYPES.GURU_GRANTH_SAHIB) =>
  new Promise((resolve, reject) => {
    banidb()
      .getAng(PageNo, { source: SourceID })
      .then((ang) => {
        const rows = ang ? ang.page.map((verse) => toVerseRow(verse, { meta: ang })) : [];
        if (rows.length > 0) {
          resolve(rows);
        } else {
          reject();
        }
      })
      .catch(reject);
  });

/** The ShabadID of a verse. */
const getShabad = (VerseID) =>
  new Promise((resolve, reject) => {
    banidb()
      .getVerse(VerseID)
      .then((verse) => {
        if (verse) {
          resolve(verse.shabadId);
        }
      })
      .catch(reject);
  });

const randomShabad = (SourceID = CONSTS.SOURCE_TYPES.GURU_GRANTH_SAHIB) =>
  new Promise((resolve, reject) => {
    banidb()
      .getRandomShabad(SourceID)
      .then((shabad) => {
        if (shabad) {
          resolve(shabad.shabadInfo.shabadId);
        }
      })
      .catch(reject);
  });

/** A verse's Gurmukhi text: `verseId`'s, or the first of `shabadId`'s. */
const getVerse = (shabadId, verseId) =>
  new Promise((resolve, reject) => {
    const text = verseId
      ? banidb()
          .getVerse(verseId)
          .then((verse) => verse && verse.verse.gurmukhi)
      : banidb()
          .getShabad(shabadId)
          .then((shabad) => shabad && shabad.verses[0].verse.gurmukhi);
    text
      .then((gurmukhi) => {
        if (gurmukhi !== null && gurmukhi !== undefined) {
          resolve(gurmukhi);
        }
      })
      .catch(reject);
  });

// --- banis and ceremonies -------------------------------------------------------

/** Every bani the app lists (IDs below 10000, as Realm did). */
const listBanis = () => banidb().getBanis({ belowId: 10000 });

const toNameRow = (row, extra = {}) =>
  realmObject({
    ID: row.ID,
    Token: row.token,
    Gurmukhi: row.gurmukhi,
    Updated: row.updated,
    ...extra,
  });

const loadBanis = () =>
  new Promise((resolve, reject) => {
    listBanis()
      .then(({ rows }) => rows.map(toNameRow))
      .then(resolveRows(resolve))
      .catch(reject);
  });

/** The app's bani length settings (Banis_Shabad columns). */
const BANI_LENGTHS = ['existsSGPC', 'existsMedium', 'existsTaksal', 'existsBuddhaDal'];

/** A custom (heading / instruction) line, as Realm's Banis_Custom / Ceremonies_Custom. */
const toCustomRow = (line) =>
  realmObject({
    ID: line.customId,
    English: line.english,
    // English-only instructions have no Gurmukhi (the package gives '').
    Gurmukhi: line.verse.verse.gurmukhi || null,
  });

/** Realm's `Verse` for a line: the verse it shows (by its own ID), or null. */
const lineVerse = (line) =>
  line.sourceVerseId
    ? toVerseRow(line.verse, { id: line.sourceVerseId, shabadId: line.shabadId })
    : null;

const loadBani = (BaniID, BaniLength) =>
  new Promise((resolve, reject) => {
    Promise.all([
      // Filtered here rather than with the package's `length`, which (like the
      // API) then leaves out the lines' exists* flags.
      banidb().getBani(BaniID),
      banidb().getBanis({ belowId: Number.MAX_SAFE_INTEGER }),
    ])
      .then(([baniResult, { rows }]) => {
        if (!baniResult) {
          return [];
        }
        const name = rows.find((row) => row.ID === Number(BaniID));
        const Bani = name
          ? toNameRow(name)
          : realmObject({ ID: Number(BaniID), Gurmukhi: baniResult.baniInfo.gurmukhi });
        const lines = BANI_LENGTHS.includes(BaniLength)
          ? baniResult.verses.filter((line) => line[BaniLength])
          : baniResult.verses;
        return lines.map((line) =>
          realmObject({
            // Banis_Shabad's own ID (the line ID the bani controller syncs on).
            ID: line.verse.verseId,
            Bani,
            Verse: lineVerse(line),
            Custom: line.customId ? toCustomRow(line) : null,
            header: line.header,
            MangalPosition: line.mangalPosition,
            Paragraph: line.paragraph,
            existsSGPC: line.existsSGPC,
            existsMedium: line.existsMedium,
            existsTaksal: line.existsTaksal,
            existsBuddhaDal: line.existsBuddhaDal,
          }),
        );
      })
      .then(resolveRows(resolve))
      .catch(reject);
  });

const loadCeremonies = () =>
  new Promise((resolve, reject) => {
    banidb()
      .getCeremonies()
      .then(({ rows }) =>
        rows
          .map((row) => toNameRow(row, { Seq: row.seq }))
          // Realm listed them by ID.
          .sort((a, b) => a.ID - b.ID),
      )
      .then(resolveRows(resolve))
      .catch(reject);
  });

const loadCeremony = (ceremonyID) =>
  new Promise((resolve, reject) => {
    banidb()
      .getCeremony(ceremonyID)
      .then((ceremony) => {
        if (!ceremony) {
          return [];
        }
        const { ceremonyInfo } = ceremony;
        const Ceremony = realmObject({
          ID: ceremonyInfo.ceremonyID,
          Token: ceremonyInfo.token,
          Gurmukhi: ceremonyInfo.gurmukhi,
        });
        // The package expands a verse range into one line per verse; Realm had one
        // Ceremonies_Shabad row with the verses in `VerseRange`.
        const rows = [];
        ceremony.verses.forEach((line) => {
          const previous = rows[rows.length - 1];
          if (previous && previous.ID === line.verse.verseId) {
            if (previous.Verse) {
              previous.VerseRange = [previous.Verse];
              previous.Verse = null;
            }
            previous.VerseRange.push(lineVerse(line));
            return;
          }
          rows.push(
            realmObject({
              ID: line.verse.verseId,
              Seq: line.seq,
              Ceremony,
              Verse: lineVerse(line),
              Custom: line.customId ? toCustomRow(line) : null,
              VerseRange: [],
            }),
          );
        });
        return rows;
      })
      .then(resolveRows(resolve))
      .catch(reject);
  });

// --- filters -------------------------------------------------------------------

const FILTER_OPTIONS = {
  writer: { list: () => banidb().getWriters(), column: 'WriterID' },
  raag: { list: () => banidb().getRaags(), column: 'RaagID' },
  source: { list: () => banidb().getSources(), column: 'SourceID' },
};

/** The writers / raags / sources with the given IDs. */
const getFilterOption = (type, idArray) =>
  new Promise((resolve, reject) => {
    const option = FILTER_OPTIONS[type];
    if (!option) {
      resolve({ error: `Unable to find a filter option with type: ${type}` });
      return;
    }
    const ids = idArray.map(String);
    const position = (row) => ids.indexOf(String(row[option.column]));
    option
      .list()
      // In the order asked for, which is the order the filter dropdown lists them.
      .then(({ rows }) =>
        rows
          .filter((row) => position(row) !== -1)
          .sort((a, b) => position(a) - position(b))
          .map((row) => realmObject({ ...row })),
      )
      .then(resolveRows(resolve))
      .catch(reject);
  });

export {
  CONSTS,
  query,
  loadShabad,
  loadBanis,
  loadBani,
  loadCeremony,
  loadCeremonies,
  getAng,
  loadAng,
  getShabad,
  randomShabad,
  getVerse,
  getFilterOption,
};
