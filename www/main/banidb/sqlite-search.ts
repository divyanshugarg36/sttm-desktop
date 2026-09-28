// The BaniDB functions, read from the SQLite BaniDB through
// @khalisfoundation/banidb. Each returns the rows the app was written for when
// it used Realm (Verse rows with Gurmukhi, Translations / Visraam as JSON
// strings, Source, Shabads, …), so the code reading them is unchanged. As with
// Realm, a lookup that finds nothing leaves its promise pending.
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import * as remote from '@electron/remote';
import {
  createBaniDB,
  type BaniDB,
  type Ceremony as PackageCeremony,
  type CeremonyVerse,
  type BaniListItem,
  type BaniVerse,
  type LineVerse,
  type Raag,
  type Source,
  type SqlValue,
  type Verse,
  type Writer,
} from '@khalisfoundation/banidb';

import * as CONSTS from './constants';

const userDataPath = remote.app.getPath('userData');

/** STTM_BANIDB_SQLITE points at a local file (development); else the downloaded one. */
export const sqlitePath =
  process.env.STTM_BANIDB_SQLITE || path.resolve(userDataPath, 'banidb.sqlite');

export const hasSqliteDB = () => fs.existsSync(sqlitePath) && fs.statSync(sqlitePath).size > 0;

const WAIT_FOR_DB_MS = 1000;

let client: BaniDB | null = null;
let database: DatabaseSync | null = null;

/** The open database. On first launch it waits for the download to finish. */
const openDatabase = async (): Promise<DatabaseSync> => {
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

const banidb = (): BaniDB => {
  if (!client) {
    client = createBaniDB({
      db: {
        query: async <T>(sql: string, params: SqlValue[] = []) =>
          (await openDatabase()).prepare(sql).all(...params) as T[],
      },
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

/** A Realm-era row: its fields, plus the toJSON() Realm objects had. */
export type RealmRow<T> = T & { toJSON(): T };

export interface LegacySource {
  SourceID: string;
  SourceGurmukhi: string | null;
  SourceUnicode: string | null;
  SourceEnglish: string | null;
}

export interface LegacyWriter {
  WriterID: number;
  WriterEnglish: string | null;
  WriterGurmukhi: string | null;
  WriterUnicode: string | null;
}

export interface LegacyRaag {
  RaagID: number;
  RaagGurmukhi: string | null;
  RaagUnicode: string | null;
  RaagEnglish: string | null;
  RaagWithPage: string | null;
}

/** Realm's `Verse`: Translations and Visraam are the DB's JSON strings. */
export interface LegacyVerse {
  ID: number;
  Gurmukhi: string;
  Translations: string;
  Visraam: string | null;
  PageNo: number | undefined;
  LineNo: number | undefined;
  Updated: string | undefined;
  Source: RealmRow<LegacySource> | null;
  Writer: RealmRow<LegacyWriter> | null;
  Raag: RealmRow<LegacyRaag> | null;
  Shabads: RealmRow<{ ShabadID: number }>[];
}

/** A bani or ceremony in a list (Realm's Banis / Ceremonies). */
export interface LegacyNameRow {
  ID: number;
  Token?: string;
  Gurmukhi: string;
  Updated?: string;
  Seq?: number;
}

/** A custom heading / instruction line (Banis_Custom / Ceremonies_Custom). */
export interface LegacyCustomLine {
  ID: number | null;
  English: string | null;
  Gurmukhi: string | null;
}

/** A line of a bani (Banis_Shabad). */
export interface LegacyBaniLine {
  ID: number;
  Bani: RealmRow<LegacyNameRow>;
  Verse: RealmRow<LegacyVerse> | null;
  Custom: RealmRow<LegacyCustomLine> | null;
  header: number;
  MangalPosition: BaniVerse['mangalPosition'];
  Paragraph: number;
  existsSGPC: number | null | undefined;
  existsMedium: number | null | undefined;
  existsTaksal: number | null | undefined;
  existsBuddhaDal: number | null | undefined;
}

/** A line of a ceremony (Ceremonies_Shabad); a verse range lists its verses. */
export interface LegacyCeremonyLine {
  ID: number;
  Seq: number;
  Ceremony: RealmRow<LegacyNameRow>;
  Verse: RealmRow<LegacyVerse> | null;
  Custom: RealmRow<LegacyCustomLine> | null;
  VerseRange: (RealmRow<LegacyVerse> | null)[];
}

/** Realm objects have a toJSON() that returns a plain copy; the app calls it. */
const realmObject = <T extends object>(fields: T): RealmRow<T> =>
  Object.defineProperty(fields, 'toJSON', {
    value(this: T) {
      return { ...this };
    },
  }) as RealmRow<T>;

/** The package's parsed translations back to the DB's JSON (Punjabi split into pu / puu). */
const toTranslationsJSON = (translation: Partial<Verse['translation']> = {}) => {
  const pu: Record<string, string | null> = {};
  const puu: Record<string, string | null> = {};
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

const toSource = (source: Source | undefined) =>
  source && source.sourceId
    ? realmObject<LegacySource>({
        SourceID: source.sourceId,
        SourceGurmukhi: source.gurmukhi,
        SourceUnicode: source.unicode,
        SourceEnglish: source.english,
      })
    : null;

const toWriter = (writer: Writer | undefined) =>
  writer && writer.writerId !== null && writer.writerId !== undefined
    ? realmObject<LegacyWriter>({
        WriterID: writer.writerId,
        WriterEnglish: writer.english,
        WriterGurmukhi: writer.gurmukhi,
        WriterUnicode: writer.unicode,
      })
    : null;

const toRaag = (raag: Raag | undefined) =>
  raag && raag.raagId !== null && raag.raagId !== undefined
    ? realmObject<LegacyRaag>({
        RaagID: raag.raagId,
        RaagGurmukhi: raag.gurmukhi,
        RaagUnicode: raag.unicode,
        RaagEnglish: raag.english,
        RaagWithPage: raag.raagWithPage,
      })
    : null;

/** Where a verse's source, writer and raag come from: itself, or its shabad / ang. */
interface VerseMeta {
  source?: Source;
  writer?: Writer;
  raag?: Raag;
}

/** A Realm `Verse`, from the package's verse (and, for lines without meta, their shabad's). */
const toVerseRow = (
  verse: LineVerse & { shabadId?: number },
  {
    id = verse.verseId,
    shabadId = verse.shabadId,
    meta = verse,
  }: { id?: number; shabadId?: number | null; meta?: VerseMeta } = {},
): RealmRow<LegacyVerse> =>
  realmObject<LegacyVerse>({
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
const resolveRows =
  <T>(resolve: (rows: T[]) => void) =>
  (rows: T[]) => {
    if (rows && rows.length > 0) {
      resolve(rows);
    }
  };

// --- search ------------------------------------------------------------------

/** Desktop's search types → the package's (desktop's ang search is 4, the API's 5). */
const SEARCH_TYPE: Record<number, number> = {
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS]: 0,
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS_ANYWHERE]: 1,
  [CONSTS.SEARCH_TYPES.GURMUKHI_WORD]: 2,
  [CONSTS.SEARCH_TYPES.ENGLISH_WORD]: 3,
  [CONSTS.SEARCH_TYPES.ANG]: 5,
  [CONSTS.SEARCH_TYPES.MAIN_LETTERS]: 6,
  [CONSTS.SEARCH_TYPES.FIRST_LETTERS_ENGLISH]: 7,
};

const query = (
  searchQuery: string,
  searchType: number,
  searchSource: string,
  resultRows = 20,
): Promise<RealmRow<LegacyVerse>[]> => {
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

type PackageShabad = Exclude<Awaited<ReturnType<BaniDB['getShabad']>>, null>;
type PackageAng = Exclude<Awaited<ReturnType<BaniDB['getAng']>>, null>;

/** One shabad (getShabad with several IDs returns a MultiShabad instead). */
const singleShabad = (shabad: PackageShabad | null) =>
  shabad && 'verses' in shabad ? shabad : null;

/** One ang (getAng with a range returns a MultiAng instead). */
const singleAng = (ang: PackageAng | null) => (ang && 'page' in ang ? ang : null);

const loadShabad = (ShabadID: number | string) =>
  new Promise<RealmRow<LegacyVerse>[]>((resolve, reject) => {
    banidb()
      .getShabad(ShabadID)
      .then(singleShabad)
      .then((shabad) =>
        shabad ? shabad.verses.map((verse) => toVerseRow(verse, { meta: shabad.shabadInfo })) : [],
      )
      .then(resolveRows(resolve))
      .catch(reject);
  });

/** The ang and source a shabad starts on. */
const getAng = (ShabadID: number | string) =>
  new Promise<{ PageNo: number; SourceID: string }>((resolve, reject) => {
    banidb()
      .getShabad(ShabadID)
      .then(singleShabad)
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

const loadAng = (
  PageNo: number | string,
  SourceID: string = CONSTS.SOURCE_TYPES.GURU_GRANTH_SAHIB,
) =>
  new Promise<RealmRow<LegacyVerse>[]>((resolve, reject) => {
    banidb()
      .getAng(PageNo, { source: SourceID })
      .then(singleAng)
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
const getShabad = (VerseID: number) =>
  new Promise<number>((resolve, reject) => {
    banidb()
      .getVerse(VerseID)
      .then((verse) => {
        if (verse) {
          resolve(verse.shabadId);
        }
      })
      .catch(reject);
  });

const randomShabad = (SourceID: string = CONSTS.SOURCE_TYPES.GURU_GRANTH_SAHIB) =>
  new Promise<number>((resolve, reject) => {
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
const getVerse = (shabadId: number | string, verseId?: number | null) =>
  new Promise<string>((resolve, reject) => {
    const text: Promise<string | null | undefined> = verseId
      ? banidb()
          .getVerse(verseId)
          .then((verse) => verse && verse.verse.gurmukhi)
      : banidb()
          .getShabad(shabadId)
          .then(singleShabad)
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

const toNameRow = (row: BaniListItem, extra: Partial<LegacyNameRow> = {}) =>
  realmObject<LegacyNameRow>({
    ID: row.ID,
    Token: row.token,
    Gurmukhi: row.gurmukhi,
    Updated: row.updated,
    ...extra,
  });

const loadBanis = () =>
  new Promise<RealmRow<LegacyNameRow>[]>((resolve, reject) => {
    listBanis()
      .then(({ rows }) => rows.map((row) => toNameRow(row)))
      .then(resolveRows(resolve))
      .catch(reject);
  });

/** The app's bani length settings (Banis_Shabad columns). */
const BANI_LENGTHS = ['existsSGPC', 'existsMedium', 'existsTaksal', 'existsBuddhaDal'] as const;

type BaniLengthColumn = (typeof BANI_LENGTHS)[number];

const isBaniLength = (length: string): length is BaniLengthColumn =>
  (BANI_LENGTHS as readonly string[]).includes(length);

/** A custom (heading / instruction) line, as Realm's Banis_Custom / Ceremonies_Custom. */
const toCustomRow = (line: BaniVerse | CeremonyVerse) =>
  realmObject<LegacyCustomLine>({
    ID: line.customId,
    English: line.english,
    // English-only instructions have no Gurmukhi (the package gives '').
    Gurmukhi: line.verse.verse.gurmukhi || null,
  });

/** Realm's `Verse` for a line: the verse it shows (by its own ID), or null. */
const lineVerse = (line: BaniVerse | CeremonyVerse) =>
  line.sourceVerseId
    ? toVerseRow(line.verse, { id: line.sourceVerseId, shabadId: line.shabadId })
    : null;

const loadBani = (BaniID: number | string, BaniLength: string) =>
  new Promise<RealmRow<LegacyBaniLine>[]>((resolve, reject) => {
    Promise.all([
      // Filtered here rather than with the package's `length`, which (like the
      // API) then leaves out the lines' exists* flags.
      banidb().getBani(Number(BaniID)),
      banidb().getBanis({ belowId: Number.MAX_SAFE_INTEGER }),
    ])
      .then(([baniResult, { rows }]) => {
        if (!baniResult) {
          return [];
        }
        const name = rows.find((row) => row.ID === Number(BaniID));
        const Bani = name
          ? toNameRow(name)
          : realmObject<LegacyNameRow>({
              ID: Number(BaniID),
              Gurmukhi: baniResult.baniInfo.gurmukhi,
            });
        const lines = isBaniLength(BaniLength)
          ? baniResult.verses.filter((line) => line[BaniLength])
          : baniResult.verses;
        return lines.map((line) =>
          realmObject<LegacyBaniLine>({
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
  new Promise<RealmRow<LegacyNameRow>[]>((resolve, reject) => {
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

const loadCeremony = (ceremonyID: number | string) =>
  new Promise<RealmRow<LegacyCeremonyLine>[]>((resolve, reject) => {
    banidb()
      .getCeremony(Number(ceremonyID))
      .then((ceremony: PackageCeremony | null) => {
        if (!ceremony) {
          return [];
        }
        const { ceremonyInfo } = ceremony;
        const Ceremony = realmObject<LegacyNameRow>({
          ID: ceremonyInfo.ceremonyID,
          Token: ceremonyInfo.token,
          Gurmukhi: ceremonyInfo.gurmukhi,
        });
        // The package expands a verse range into one line per verse; Realm had one
        // Ceremonies_Shabad row with the verses in `VerseRange`.
        const rows: RealmRow<LegacyCeremonyLine>[] = [];
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
            realmObject<LegacyCeremonyLine>({
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

/** A writer / raag / source row, as listed in the filter dropdowns. */
export type FilterOptionRow = RealmRow<Record<string, unknown>>;

type FilterType = 'writer' | 'raag' | 'source';

const FILTER_OPTIONS: Record<
  FilterType,
  { list: () => Promise<{ rows: Record<string, unknown>[] }>; column: string }
> = {
  writer: { list: () => banidb().getWriters(), column: 'WriterID' },
  raag: { list: () => banidb().getRaags(), column: 'RaagID' },
  source: { list: () => banidb().getSources(), column: 'SourceID' },
};

/** The writers / raags / sources with the given IDs. */
const getFilterOption = (type: string, idArray: (number | string)[]) =>
  new Promise<FilterOptionRow[] | { error: string }>((resolve, reject) => {
    const option = FILTER_OPTIONS[type as FilterType];
    if (!option) {
      resolve({ error: `Unable to find a filter option with type: ${type}` });
      return;
    }
    const ids = idArray.map(String);
    const position = (row: Record<string, unknown>) => ids.indexOf(String(row[option.column]));
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
