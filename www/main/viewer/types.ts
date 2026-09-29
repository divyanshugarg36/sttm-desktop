/**
 * A line a slide shows: a verse, or a bani / ceremony's custom (heading or
 * instruction) line, which has English but no Translations or Visraam.
 */
export interface SlideLine {
  ID: number | null;
  Gurmukhi: string | null;
  /** The DB's visraam JSON (visraams by source). */
  Visraam?: string | null;
  /** The DB's translations JSON (VerseTranslations). */
  Translations?: string;
  English?: string | null;
}

/** The next line shown under the slide: a line, or an empty one. */
export type NextLine = Partial<Pick<SlideLine, 'Gurmukhi' | 'Visraam'>>;

/** The DB's Translations JSON: each language's translations by source. */
export interface VerseTranslations {
  en: Record<string, string | undefined>;
  pu: Record<string, string | null | undefined>;
  es: Record<string, string | undefined>;
  hi?: Record<string, string | undefined>;
}
