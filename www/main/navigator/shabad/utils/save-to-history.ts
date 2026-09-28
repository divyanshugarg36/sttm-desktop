import type { HistoryEntry } from '../../../common/store/redux/navigatorSlice';
import type { CeremonyRow, LoadedLine } from '../../utils';

export const saveToHistory = (
  shabadId: number,
  verses: CeremonyRow[],
  verseType: string,
  {
    verseHistory,
    setVerseHistory,
    baniLength,
  }: {
    verseHistory: HistoryEntry[];
    setVerseHistory: (history: HistoryEntry[]) => void;
    baniLength: string;
  },
  initialVerse: number | null = null,
) => {
  const firstVerse = verses[0] as LoadedLine;
  let verseId: number;
  if (initialVerse === null) {
    verseId = firstVerse.ID as number;
  } else {
    verseId = initialVerse;
  }
  // The loaded lines have no `verseId` (only the verse list's rows do).
  const firstVerseIndex = verses.findIndex((v) => (v as { verseId?: number }).verseId === verseId);
  let baniId = shabadId;
  let verse: string | number | null | undefined;
  if (verseType === 'shabad') {
    if (initialVerse) {
      const clickedVerse = verses.filter(
        (verseObj) => (verseObj as LoadedLine).ID === initialVerse,
      );
      if (!clickedVerse.length) {
        verse = firstVerse.Gurmukhi;
      } else {
        verse = clickedVerse.length && (clickedVerse[0] as LoadedLine).Gurmukhi;
      }
    } else {
      verse = firstVerse.Gurmukhi;
    }
  } else if (verseType === 'bani') {
    verse = firstVerse.baniName;
    baniId = firstVerse.baniId as number;
  } else if (verseType === 'ceremony') {
    verse = firstVerse.ceremonyName;
    baniId = firstVerse.ceremonyId as number;
  }
  const check = verseHistory.filter((historyObj) => historyObj.shabadId === baniId);
  if (check.length === 0) {
    const updatedHistory: HistoryEntry[] = [
      {
        shabadId: baniId,
        verseId,
        label: verse as string,
        type: verseType,
        meta: {
          baniLength,
        },
        versesRead: [verseId],
        continueFrom: verseId,
        homeVerse: firstVerseIndex,
      },
      ...verseHistory,
    ];
    setVerseHistory(updatedHistory);
    return true;
  }
  return false;
};
