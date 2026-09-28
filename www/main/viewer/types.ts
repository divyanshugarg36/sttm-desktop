import type React from 'react';

/**
 * A line a slide shows: a verse, or a bani / ceremony's custom (heading or
 * instruction) line, which has English but no Translations or Visraam.
 */
export interface SlideLine {
  ID: number | null;
  Gurmukhi: string | null;
  /** The DB's visraam JSON (VishraamPlacement). */
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

/** The DB's Visraam JSON: per source, the visraams by word position. */
export type VishraamPlacement = Record<string, { p: number; t: string }[] | undefined>;

/** A font size setting (in vh) → the style that applies it. */
export type GetFontSize = (size: number) => React.CSSProperties | undefined;
