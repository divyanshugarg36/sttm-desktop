import anvaad from 'anvaad-js';
import type { LegacyCustomLine, LegacyVerse } from '../../../banidb/sqlite-search';
import type { CeremonyRow, LoadedLine } from '../../utils';

/** A row of the verse list. */
export interface VerseItem {
  /** The row's index in the list. */
  ID: number;
  verseId: number;
  verse: string;
  english: string;
  /** Which line (pauri) the verse is in: it goes up after each line ending. */
  lineNo: number;
  crossPlatformId: number | '';
}

/** A loaded line as the verse list reads it. */
type ListedLine = LoadedLine & { English?: string | null };

export const filterRequiredVerseItems = (verses: CeremonyRow[]): VerseItem[] => {
  let versesNew: (ListedLine | null)[];
  let currentLine = 0;
  try {
    versesNew = verses.flat(1);
  } catch {
    versesNew = verses as (ListedLine | null)[];
  }
  const checkPauri = versesNew.filter((verse) => /]\d*]/.test(verse!.Gurmukhi as string));
  const regex = checkPauri.length > 1 ? /]\d*]/ : /]/;
  return versesNew
    ? versesNew.map((verse, index) => {
        if (verse) {
          const verseObj: VerseItem = {
            ID: index,
            verseId: verse.ID as number,
            verse: verse.Gurmukhi as string,
            english: verse.English ? verse.English : '',
            lineNo: currentLine,
            crossPlatformId: verse.crossPlatformID ? verse.crossPlatformID : '',
          };
          if (regex.test(verse.Gurmukhi as string)) {
            currentLine++;
          }
          return verseObj;
        }
        // A missing line: an empty row.
        return {} as VerseItem;
      })
    : [];
};

/** A line as the viewer / overlay shows it: the DB row plus its texts. */
export type OverlayLine = Partial<Omit<LegacyVerse, 'ID' | 'Gurmukhi'>> & {
  ID?: LegacyVerse['ID'] | LegacyCustomLine['ID'];
  Gurmukhi?: LegacyVerse['Gurmukhi'] | LegacyCustomLine['Gurmukhi'];
  English?: string | null;
  Punjabi?: string;
  Spanish?: string;
  Hindi?: string;
  Transliteration?: { English: string; Shahmukhi: string; Devanagari: string };
  Unicode?: string;
};

/** The DB's Translations JSON: each language's translations by source. */
type Translations = Record<'en' | 'pu' | 'es', Record<string, string>> & {
  hi?: Record<string, string>;
};

export const filterOverlayVerseItems = (verses: CeremonyRow[], verseId: number | '') => {
  if (verses) {
    // A verse range (an array) has no ID, so it never matches.
    const currentIndex = verses.findIndex((obj) => !Array.isArray(obj) && obj.ID === verseId);
    const currentVerse = verses[currentIndex] as LoadedLine | undefined;
    if (currentVerse) {
      const Line: OverlayLine = { ...currentVerse.toJSON() };
      if (Line.Translations) {
        const lineTranslations = JSON.parse(Line.Translations) as Translations;
        Line.English = lineTranslations.en.bdb || lineTranslations.en.ms || lineTranslations.en.ssk;
        Line.Punjabi =
          lineTranslations.pu.bdb ||
          lineTranslations.pu.ss ||
          lineTranslations.pu.ft ||
          lineTranslations.pu.ms;
        Line.Spanish = lineTranslations.es.sn;
        Line.Hindi = (lineTranslations.hi && lineTranslations.hi.ss) || '';
      }
      Line.Transliteration = {
        English: anvaad.translit(Line.Gurmukhi || ''),
        Shahmukhi: anvaad.translit(Line.Gurmukhi || '', 'shahmukhi'),
        Devanagari: anvaad.translit(Line.Gurmukhi || '', 'devnagri'),
      };
      Line.Unicode = anvaad.unicode(Line.Gurmukhi || '');
      return Line;
    }
  }
  return {};
};
