import React, { useState, useEffect, useRef } from 'react';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';

import {
  setActiveVerseId,
  setIsMiscSlide,
  setActiveShabadId,
  setVerseHistory,
  setActivePaneId,
  setShortcuts,
  setSundarGutkaBaniId,
  setCeremonyId,
  setIsCeremonyBani,
  setIsSundarGutkaBani,
  type PaneState,
} from '../../common/store/redux/navigatorSlice';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import { sendToMain } from '../../common/ipc';
import { loadShabad, loadBani, loadCeremony, type CeremonyRow } from '../utils';
import { ShabadVerse } from '../../common/sttm-ui';
import {
  changeHomeVerse,
  changeVerse,
  filterRequiredVerseItems,
  filterOverlayVerseItems,
  udpateHistory,
  scrollToVerse,
  saveToHistory,
  copyToClipboard,
  intelligentNextVerse,
  sendToBaniController,
  FLOWER_VERSE_ID,
  type VerseItem,
} from './utils';

const baniLengthCols: Record<string, string> = {
  short: 'existsSGPC',
  medium: 'existsMedium',
  long: 'existsTaksal',
  extralong: 'existsBuddhaDal',
};

type ShabadTextProps = {
  /** The shabad, bani or ceremony ID. */
  shabadId: number | null;
  baniType: string;
  paneAttributes: PaneState;
  setPaneAttributes: ActionCreatorWithPayload<PaneState>;
  currentPane: number;
};

export const ShabadText = ({
  shabadId,
  baniType,
  paneAttributes,
  setPaneAttributes,
  currentPane,
}: ShabadTextProps) => {
  const [previousVerseIndex, setPreviousIndex] = useState<number | null>();
  const [filteredItems, setFilteredItems] = useState<VerseItem[]>([]);
  // The active verse's ID, keyed by its index in the list.
  const [activeVerse, setActiveVerse] = useState<Record<number, number>>({});
  const [rawVerses, setRawVerses] = useState<CeremonyRow[]>([]);
  const [atHome, setHome] = useState(true);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const activeVerseRef = useRef<HTMLDivElement>(null);

  const {
    activeVerseId,
    isMiscSlide,
    isSundarGutkaBani,
    sundarGutkaBaniId,
    isCeremonyBani,
    ceremonyId,
    activeShabadId,
    verseHistory,
    initialVerseId,
    activePaneId,
    shortcuts,
    lineNumber,
    savedCrossPlatformId,
  } = useAppSelector((state) => state.navigator);

  const { baniLength, liveFeed, autoplayDelay, autoplayToggle, intelligentSpacebar, akhandpatt } =
    useAppSelector((state) => state.userSettings);

  const dispatch = useAppDispatch();

  const updateTraversedVerse = (
    newTraversedVerse: number,
    verseIndex: number,
    crossPlatformId: number | null = null,
  ) => {
    if (isMiscSlide) {
      dispatch(setIsMiscSlide(false));
    }
    // Ignoring flower verse to avoid unwanted scroll during asa di vaar
    if (newTraversedVerse === FLOWER_VERSE_ID) {
      return;
    }
    if (activePaneId !== currentPane) {
      dispatch(setActivePaneId(currentPane));
    }
    changeVerse(newTraversedVerse, verseIndex, shabadId, {
      activeVerseId,
      setActiveVerseId: (verseId) => dispatch(setActiveVerseId(verseId)),
      setActiveVerse,
      activeShabadId,
      setActiveShabadId: (id) => dispatch(setActiveShabadId(id)),
      setPreviousIndex,
      baniType,
      sundarGutkaBaniId,
      setSundarGutkaBaniId: (id) => dispatch(setSundarGutkaBaniId(id)),
      ceremonyId,
      setCeremonyId: (id) => dispatch(setCeremonyId(id)),
      isSundarGutkaBani,
      setIsSundarGutkaBani: (v) => dispatch(setIsSundarGutkaBani(v)),
      isCeremonyBani,
      setIsCeremonyBani: (v) => dispatch(setIsCeremonyBani(v)),
    });
    udpateHistory(shabadId, newTraversedVerse, {
      verseHistory,
      setVerseHistory: (history) => dispatch(setVerseHistory(history)),
      setPaneAttributes: (attrs) => dispatch(setPaneAttributes(attrs)),
      paneAttributes,
    });
    sendToBaniController(crossPlatformId, filteredItems, newTraversedVerse, baniLength, {
      isSundarGutkaBani,
      sundarGutkaBaniId,
      isCeremonyBani,
      ceremonyId,
      activeShabadId,
      paneAttributes,
    });
  };

  const updateHomeVerse = (verseIndex: number) => {
    changeHomeVerse(verseIndex, {
      paneAttributes,
      setPaneAttributes: (attrs) => dispatch(setPaneAttributes(attrs)),
    });
  };

  // The loaders resolve empty (after showing an error) when loading fails.
  const setVerseList = (verseList: CeremonyRow[] | void) => {
    if (verseList!.length) {
      setRawVerses(verseList!);
      saveToHistory(
        shabadId as number,
        verseList!,
        baniType,
        {
          verseHistory,
          setVerseHistory: (history) => dispatch(setVerseHistory(history)),
          baniLength,
        },
        initialVerseId,
      );
      const filtered = filterRequiredVerseItems(verseList!);
      setFilteredItems(filtered);
      const resumeVerseId = paneAttributes?.activeVerse || filtered[0].verseId;
      if (filtered.length > 0) {
        const resumeVerseIndex = filtered.findIndex((v) => v.verseId === resumeVerseId);
        if (resumeVerseIndex >= 0) {
          updateTraversedVerse(resumeVerseId, resumeVerseIndex);
        } else {
          updateTraversedVerse(filtered[0].verseId, 0);
        }
      }
    }
  };

  useEffect(() => {
    if (baniType === 'shabad') {
      loadShabad(shabadId as number).then(setVerseList);
    } else if (baniType === 'bani') {
      loadBani(shabadId as number, baniLengthCols[baniLength]).then(setVerseList);
    } else if (baniType === 'ceremony') {
      loadCeremony(shabadId as number).then(setVerseList);
    }
  }, [shabadId, baniType, baniLength]);

  useEffect(() => {
    if (filteredItems.length) {
      setTimeout(() => {
        scrollToVerse(initialVerseId, filteredItems, virtuosoRef);
      }, 100);
      const initialVerseIndex = filteredItems.findIndex(
        (verse) => verse.verseId === initialVerseId,
      );
      const activeVerseIndex = filteredItems.findIndex((verse) => verse.verseId === activeVerseId);
      if (initialVerseIndex >= 0) {
        updateHomeVerse(initialVerseIndex);
        setActiveVerse({ [activeVerseIndex]: activeVerseId as number });
      }
      if (
        (activeShabadId === null && sundarGutkaBaniId === null && ceremonyId === null) ||
        (initialVerseIndex >= 0 && Object.keys(activeVerse).length === 0)
      ) {
        updateTraversedVerse(initialVerseId as number, initialVerseIndex);
      }
    }
  }, [filteredItems]);

  useEffect(() => {
    const baniVerseIndex = filteredItems.findIndex(
      (obj) => obj.crossPlatformId === savedCrossPlatformId,
    );
    if (baniVerseIndex >= 0) {
      // Pass the verse's real verseId (not `.ID`, which is just the array
      // index) — it becomes activeVerseId and is matched by verseId downstream
      // (e.g. sendToBaniController), so an index here highlights the wrong verse
      // and crashes the desktop→controller echo.
      updateTraversedVerse(filteredItems[baniVerseIndex].verseId, baniVerseIndex);
    }
  }, [savedCrossPlatformId]);

  useEffect(() => {
    const overlayVerse = filterOverlayVerseItems(rawVerses, activeVerseId);
    sendToMain(
      'show-line',
      JSON.stringify({
        Line: overlayVerse,
        live: liveFeed,
      }),
    );
    if (
      (isCeremonyBani && ceremonyId === paneAttributes.activeShabad) ||
      (isSundarGutkaBani && sundarGutkaBaniId === paneAttributes.activeShabad) ||
      (!isSundarGutkaBani && !isCeremonyBani && activeShabadId === paneAttributes.activeShabad)
    ) {
      if (lineNumber !== null && filteredItems[lineNumber - 1]?.verseId === activeVerseId) {
        setActiveVerse({ [lineNumber - 1]: activeVerseId });
        scrollToVerse(activeVerseId, filteredItems, virtuosoRef);
      }
    }
  }, [rawVerses, activeShabadId, activeVerseId, sundarGutkaBaniId, ceremonyId]);

  const getVerse = (direction: 'next' | 'prev') => {
    let verseIndex: number | null = null;
    if (direction === 'next') {
      Object.keys(activeVerse).forEach((activeVerseIndex) => {
        if (filteredItems.length - 1 > parseInt(activeVerseIndex, 10)) {
          let nextVerseIndex = parseInt(activeVerseIndex, 10) + 1;
          // Ignoring flower verse to avoid unwanted scroll during asa di vaar
          if (filteredItems[nextVerseIndex].verseId === FLOWER_VERSE_ID) {
            nextVerseIndex++;
          }
          verseIndex = nextVerseIndex;
        }
      });
    } else if (direction === 'prev') {
      Object.keys(activeVerse).forEach((activeVerseIndex) => {
        if (parseInt(activeVerseIndex, 10) > 0) {
          let prevVerseIndex = parseInt(activeVerseIndex, 10) - 1;
          // Ignoring flower verse to avoid unwanted scroll during asa di vaar
          if (filteredItems[prevVerseIndex].verseId === FLOWER_VERSE_ID) {
            prevVerseIndex--;
          }
          verseIndex = prevVerseIndex;
        }
      });
    }
    if (verseIndex !== null) {
      const { verseId } = filteredItems[verseIndex];
      return { verseIndex, verseId };
    }
    return null;
  };

  useEffect(() => {
    if (activePaneId === currentPane) {
      if (shortcuts.nextVerse) {
        const nextVerse = getVerse('next');
        if (nextVerse) {
          updateTraversedVerse(nextVerse.verseId, nextVerse.verseIndex);
          scrollToVerse(nextVerse.verseId, filteredItems, virtuosoRef);
        } else if (akhandpatt && !isSundarGutkaBani && !isCeremonyBani) {
          dispatch(
            setShortcuts({
              ...shortcuts,
              nextShabad: true,
              nextVerse: false,
            }),
          );
        }
        dispatch(
          setShortcuts({
            ...shortcuts,
            nextVerse: false,
          }),
        );
      }
      if (shortcuts.prevVerse) {
        const prevVerse = getVerse('prev');
        if (prevVerse) {
          updateTraversedVerse(prevVerse.verseId, prevVerse.verseIndex);
          scrollToVerse(prevVerse.verseId, filteredItems, virtuosoRef);
        }
        dispatch(
          setShortcuts({
            ...shortcuts,
            prevVerse: false,
          }),
        );
      }
      if (shortcuts.homeVerse) {
        const verse = intelligentNextVerse(filteredItems, {
          activeVerseId: paneAttributes.activeVerse,
          previousVerseIndex,
          setPreviousIndex,
          atHome,
          setHome,
          homeVerse: paneAttributes.homeVerse,
          intelligentSpacebar,
        });
        if (verse) {
          updateTraversedVerse(verse.verseId, verse.verseIndex);
          scrollToVerse(verse.verseId, filteredItems, virtuosoRef);
        }
        dispatch(
          setShortcuts({
            ...shortcuts,
            homeVerse: false,
          }),
        );
      }
      if (shortcuts.copyToClipboard) {
        copyToClipboard(activeVerseRef);
        dispatch(
          setShortcuts({
            ...shortcuts,
            copyToClipboard: false,
          }),
        );
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    const milisecondsDelay = parseInt(String(autoplayDelay), 10) * 1000;
    const interval = setInterval(() => {
      if (autoplayToggle) {
        dispatch(
          setShortcuts({
            ...shortcuts,
            nextVerse: true,
          }),
        );
      }
    }, milisecondsDelay);
    return () => {
      clearInterval(interval);
    };
  }, [autoplayToggle, autoplayDelay]);

  return (
    <div className="shabad-pane__list">
      <div className="verse-list">
        <Virtuoso
          id={`shabad-text-${currentPane}`}
          data={filteredItems}
          ref={virtuosoRef}
          totalCount={filteredItems.length}
          itemContent={(index, verseObj) => {
            const { verseId, verse, english } = verseObj;
            return (
              <ShabadVerse
                key={index}
                activeVerse={activeVerse}
                isHomeVerse={paneAttributes.homeVerse}
                lineNumber={index}
                versesRead={paneAttributes.versesRead}
                activeVerseRef={activeVerseRef}
                verse={verse}
                englishVerse={english}
                verseId={verseId}
                changeHomeVerse={updateHomeVerse}
                updateTraversedVerse={
                  updateTraversedVerse as React.ComponentProps<
                    typeof ShabadVerse
                  >['updateTraversedVerse']
                }
              />
            );
          }}
        />
      </div>
    </div>
  );
};
