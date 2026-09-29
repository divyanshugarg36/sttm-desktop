import type { HistoryEntry, PaneState } from '../../../common/store/redux/navigatorSlice';
import type { VerseItem } from './filter-verse-items';

// Records the verse in the shabad's history entry: where to continue from and
// which verses have been read (ticked in the verse list). verseHistory is
// frozen Redux state, so the entry is replaced rather than edited in place.
export const udpateHistory = (
  currentShabadId: number | null,
  newTraversedVerse: number,
  {
    verseHistory,
    setVerseHistory,
    setPaneAttributes,
    paneAttributes,
  }: {
    verseHistory: HistoryEntry[];
    setVerseHistory: (history: HistoryEntry[]) => void;
    setPaneAttributes: (pane: PaneState) => void;
    paneAttributes: PaneState;
  },
) => {
  const existingShabadIndex = verseHistory.findIndex(
    (historyShabad) => historyShabad.shabadId === currentShabadId,
  );
  const currentHistoryObj = verseHistory[existingShabadIndex];
  if (currentHistoryObj) {
    const isNewVerse = !currentHistoryObj.versesRead.includes(newTraversedVerse);
    if (!isNewVerse && currentHistoryObj.continueFrom === newTraversedVerse) {
      return;
    }
    const updatedHistoryObj = {
      ...currentHistoryObj,
      continueFrom: newTraversedVerse,
      versesRead: isNewVerse
        ? [...currentHistoryObj.versesRead, newTraversedVerse]
        : currentHistoryObj.versesRead,
    };
    setVerseHistory(
      verseHistory.map((historyShabad, index) =>
        index === existingShabadIndex ? updatedHistoryObj : historyShabad,
      ),
    );
    // activeVerse drives resuming the shabad and the intelligent spacebar, so
    // it follows every verse change, not just the first visit.
    if (isNewVerse || paneAttributes.activeVerse !== newTraversedVerse) {
      setPaneAttributes({
        ...paneAttributes,
        activeVerse: newTraversedVerse,
        versesRead: updatedHistoryObj.versesRead,
      });
    }
  }
};

/** What changeVerse reads and sets: the navigator's active verse, shabad, bani and ceremony. */
type ChangeVerseState = {
  activeVerseId: number | '';
  setActiveVerseId: (verseId: number) => void;
  setActiveVerse: (activeVerse: Record<number, number>) => void;
  setActiveShabadId: (id: number | null) => void;
  activeShabadId: number | string | null;
  setPreviousIndex: (index: number | null) => void;
  baniType: string;
  sundarGutkaBaniId: number | null;
  setSundarGutkaBaniId: (id: number | null) => void;
  ceremonyId: number | null;
  setCeremonyId: (id: number | null) => void;
  isSundarGutkaBani: boolean;
  setIsSundarGutkaBani: (isSundarGutkaBani: boolean) => void;
  isCeremonyBani: boolean;
  setIsCeremonyBani: (isCeremonyBani: boolean) => void;
};

export const changeVerse = (
  newTraversedVerse: number,
  verseIndex: number,
  clickedShabad: number | null,
  {
    activeVerseId,
    setActiveVerseId,
    setActiveVerse,
    setActiveShabadId,
    activeShabadId,
    setPreviousIndex,
    baniType,
    sundarGutkaBaniId,
    setSundarGutkaBaniId,
    ceremonyId,
    setCeremonyId,
    isSundarGutkaBani,
    setIsSundarGutkaBani,
    isCeremonyBani,
    setIsCeremonyBani,
  }: ChangeVerseState,
) => {
  switch (baniType) {
    case 'bani':
      if (clickedShabad !== sundarGutkaBaniId) {
        setSundarGutkaBaniId(clickedShabad);
        setPreviousIndex(null);
      }
      if (!isSundarGutkaBani) {
        setIsSundarGutkaBani(true);
      }
      if (isCeremonyBani) {
        setIsCeremonyBani(false);
      }
      break;
    case 'ceremony':
      if (clickedShabad !== ceremonyId) {
        setCeremonyId(clickedShabad);
        setPreviousIndex(null);
      }

      if (isSundarGutkaBani) {
        setIsSundarGutkaBani(false);
      }
      if (!isCeremonyBani) {
        setIsCeremonyBani(true);
      }
      break;
    case 'shabad':
      if (clickedShabad !== activeShabadId) {
        setActiveShabadId(clickedShabad);
        setPreviousIndex(null);
      }
      if (isSundarGutkaBani) {
        setIsSundarGutkaBani(false);
      }
      if (isCeremonyBani) {
        setIsCeremonyBani(false);
      }
      break;
    default:
      break;
  }
  setActiveVerse({ [verseIndex]: newTraversedVerse });
  if (activeVerseId !== newTraversedVerse) {
    setActiveVerseId(newTraversedVerse);
  }
};

export const sendToBaniController = (
  crossPlatformId: number | null,
  activeShabad: VerseItem[],
  newTraversedVerse: number,
  baniLength: string,
  {
    isSundarGutkaBani,
    sundarGutkaBaniId,
    isCeremonyBani,
    ceremonyId,
    activeShabadId,
    paneAttributes,
  }: {
    isSundarGutkaBani: boolean;
    sundarGutkaBaniId: number | null;
    isCeremonyBani: boolean;
    ceremonyId: number | null;
    activeShabadId: number | string | null;
    paneAttributes: PaneState;
  },
) => {
  if (window.socket !== undefined && window.socket !== null) {
    let baniVerse: VerseItem | undefined;
    if (!crossPlatformId) {
      baniVerse = activeShabad.find((obj) => obj.verseId === newTraversedVerse);
    }
    const baniHighlight = crossPlatformId || baniVerse?.crossPlatformId || undefined;
    // The verse's 1-based position. Bani and ceremony verse ids don't share
    // a space with the web controller's (ceremony rows have no
    // crossPlatformId), so the web finds the verse by its position, as the
    // desktop does for the controller's lineCount.
    const verseIndex = activeShabad.findIndex((obj) => obj.verseId === newTraversedVerse);
    const lineCount = verseIndex >= 0 ? verseIndex + 1 : undefined;
    // A bani's verse can be missing from the list while it's still loading;
    // skip the bani/ceremony update then.
    if ((isSundarGutkaBani && sundarGutkaBaniId) || (isCeremonyBani && ceremonyId)) {
      if (!baniHighlight && !lineCount) return;
    }
    if (isSundarGutkaBani && sundarGutkaBaniId) {
      window.socket.emit('data', {
        host: 'sttm-desktop',
        type: 'bani',
        id: paneAttributes.activeShabad,
        shabadid: paneAttributes.activeShabad, // @deprecated
        highlight: baniHighlight,
        lineCount,
        baniLength,
        // mangalPosition,
        verseChange: false,
      });
    } else if (isCeremonyBani && ceremonyId) {
      window.socket.emit('data', {
        host: 'sttm-desktop',
        type: 'ceremony',
        id: paneAttributes.activeShabad,
        shabadid: paneAttributes.activeShabad, // @deprecated
        highlight: baniHighlight,
        lineCount,
        verseChange: false,
      });
    } else if (activeShabadId) {
      window.socket.emit('data', {
        type: 'shabad',
        host: 'sttm-desktop',
        id: paneAttributes.activeShabad,
        shabadid: paneAttributes.activeShabad, // @deprecated
        highlight: newTraversedVerse,
        homeId: paneAttributes.homeVerse,
        verseChange: false,
      });
    }
  }
};

const skipIkOnkar = (shabadVerses: VerseItem[], index: number): number => {
  if (shabadVerses[index]) {
    // `.verse` is the line's text, which has no `verse` field of its own, so
    // `gurmukhi` is undefined here.
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { verse: gurmukhi } = shabadVerses[index]?.verse as unknown as { verse?: string };
    const { verseId } = shabadVerses[index];
    if (verseId !== 1 && /^(<>)/gm.test(gurmukhi as string)) {
      return index + 1;
    }
    return index;
  }
  return 0;
};

const skipMangla = (shabadVerses: VerseItem[], index: number) => {
  const gurmukhi = shabadVerses[index]?.verse;
  if (/(mhlw [\w])|(mÚ [\w])/.test(gurmukhi as string) || (index === 0 && /sloku/.test(gurmukhi))) {
    return skipIkOnkar(shabadVerses, index + 1);
  }
  return skipIkOnkar(shabadVerses, index);
};

export const intelligentNextVerse = (
  filteredItems: VerseItem[],
  {
    activeVerseId,
    previousVerseIndex,
    setPreviousIndex,
    atHome,
    setHome,
    homeVerse,
    intelligentSpacebar,
  }: {
    activeVerseId: number | '';
    /** Undefined until a verse has been shown. */
    previousVerseIndex: number | null | undefined;
    setPreviousIndex: (index: number | null) => void;
    atHome: boolean;
    setHome: (atHome: boolean) => void;
    homeVerse: number | false;
    intelligentSpacebar: boolean;
  },
) => {
  const handleIntelligentSpacebar = (nextIndex: number, currentVerseIndex: number) => {
    let nextVerseIndex = nextIndex;

    if (atHome) {
      if (previousVerseIndex !== null) {
        nextVerseIndex = (previousVerseIndex as number) + 1;
        if (nextVerseIndex >= filteredItems.length) {
          nextVerseIndex = 0;
        }
      } else {
        nextVerseIndex = 0;
      }
      nextVerseIndex = skipMangla(filteredItems, nextVerseIndex);
      if (nextVerseIndex === homeVerse) {
        nextVerseIndex++;
      }
      setPreviousIndex(nextVerseIndex);
      setHome(false);
    } else {
      nextVerseIndex = skipMangla(filteredItems, currentVerseIndex + 1);

      if (nextVerseIndex >= filteredItems.length) {
        nextVerseIndex = 0;
      }
      const currentVerseObj = filteredItems[currentVerseIndex];
      const nextVerseObj = filteredItems[nextVerseIndex];

      if (currentVerseObj.lineNo !== nextVerseObj.lineNo) {
        nextVerseIndex = homeVerse as number;
        setHome(true);
      } else {
        setPreviousIndex(nextVerseIndex);
      }
    }
    return nextVerseIndex;
  };

  if (homeVerse) {
    const currentVerseIndex = filteredItems.findIndex(({ verseId }) => verseId === activeVerseId);
    let nextVerseIndex = homeVerse;

    if (intelligentSpacebar) {
      nextVerseIndex = handleIntelligentSpacebar(nextVerseIndex, currentVerseIndex);
    }

    const nextVerseId = filteredItems[nextVerseIndex].verseId;
    return { verseId: nextVerseId, verseIndex: nextVerseIndex };
  }
  return null;
};
