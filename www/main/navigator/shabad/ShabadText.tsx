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
  // Id of the shabad/bani whose verses are currently in filteredItems.
  const loadedShabadIdRef = useRef<number | null>(null);

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
      loadedShabadIdRef.current = shabadId as number;
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

  // Re-opening the bani that is already loaded (from Sundar Gutka) doesn't
  // change shabadId, so nothing reloads. Restart it from the first verse here.
  // A different bani is still loading, so setVerseList handles that case.
  useEffect(() => {
    if (
      paneAttributes.baniOpenedAt &&
      baniType === 'bani' &&
      loadedShabadIdRef.current === shabadId &&
      filteredItems.length
    ) {
      updateTraversedVerse(filteredItems[0].verseId, 0);
      scrollToVerse(filteredItems[0].verseId, filteredItems, virtuosoRef);
    }
  }, [paneAttributes.baniOpenedAt]);

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
    // Bani/ceremony verse sync from a controller. The web controller and
    // desktop load the same bani/ceremony, so their verse lists share order
    // and count, but the verse ids live in different spaces (ceremony rows
    // have no crossPlatformId; banis differ too). So select by the 1-based
    // line position the controller sends (recorded as lineNumber).
    //
    // Deliberately NOT gated on savedCrossPlatformId: the web's verseId can
    // collide with the loaded verse's id across the two id spaces (e.g. Gur
    // Mantar: activeVerseId 2 == the clicked verse's web verseId 2), which
    // stops the handler from ever setting savedCrossPlatformId on the first
    // change, and the display would stay stuck on the opening verse. Id
    // matching remains the fallback for shabads and native (mobile)
    // controllers, which send a crossPlatformId but no line position.
    const isPosition = baniType === 'bani' || baniType === 'ceremony';
    const positionIndex = lineNumber != null ? lineNumber - 1 : -1;
    const hasValidPosition =
      isPosition && positionIndex >= 0 && positionIndex < filteredItems.length;
    let baniVerseIndex = -1;
    if (hasValidPosition) {
      baniVerseIndex = positionIndex;
    } else if (savedCrossPlatformId != null) {
      baniVerseIndex = filteredItems.findIndex(
        (obj) =>
          obj.crossPlatformId === savedCrossPlatformId || obj.verseId === savedCrossPlatformId,
      );
    }
    if (baniVerseIndex >= 0) {
      const matched = filteredItems[baniVerseIndex];
      // Pass the verse's real verseId (not `.ID`, which is just the array
      // index) — it becomes activeVerseId and is matched by verseId downstream
      // (e.g. sendToBaniController), so an index here highlights the wrong verse
      // and crashes the desktop→controller echo.
      updateTraversedVerse(matched.verseId, baniVerseIndex);
      // Highlighting alone doesn't move the virtualized list; scroll the
      // presenter view to the matched verse so the display actually changes.
      scrollToVerse(matched.verseId, filteredItems, virtuosoRef);
    }
    // `filteredItems` is a dep so a verse that arrives after the bani finishes
    // loading is picked up on the next render. Safe because a new bani clears
    // savedCrossPlatformId and lineNumber, so this never re-applies a stale
    // verse to a freshly-loaded bani. `lineNumber` is a dep so a ceremony
    // verse change that only moves the line position still re-resolves.
  }, [savedCrossPlatformId, filteredItems, lineNumber]);

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
