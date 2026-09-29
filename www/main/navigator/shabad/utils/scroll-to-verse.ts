import type { VirtuosoHandle } from 'react-virtuoso';
import { FLOWER_VERSE_ID } from '.';
import type { VerseItem } from './filter-verse-items';

export const scrollToVerse = (
  verseId: number | '' | null,
  activeShabad: VerseItem[],
  virtuosoRef: React.RefObject<VirtuosoHandle>,
) => {
  const verseIndex = activeShabad.findIndex((obj) => obj.verseId === verseId);
  // Ignoring flower verse to avoid unwanted scroll during asa di vaar
  if (verseIndex >= 0 && verseId !== FLOWER_VERSE_ID && activeShabad[verseIndex].verse !== ',') {
    virtuosoRef.current!.scrollToIndex({
      index: verseIndex,
      behavior: 'smooth',
      align: 'center',
    });
  }
};
