import React, { useState, useEffect, useRef } from 'react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import { Virtuoso } from 'react-virtuoso';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';

import { loadShabad, loadBani, loadCeremony } from '../utils';
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
} from './utils';

const baniLengthCols = {
  short: 'existsSGPC',
  medium: 'existsMedium',
  long: 'existsTaksal',
  extralong: 'existsBuddhaDal',
};

export const ShabadText = ({
  shabadId,
  baniType,
  paneAttributes,
  setPaneAttributes,
  currentPane,
}) => {
  const [previousVerseIndex, setPreviousIndex] = useState();
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeVerse, setActiveVerse] = useState({});
  const [rawVerses, setRawVerses] = useState([]);
  const [atHome, setHome] = useState(true);

  const virtuosoRef = useRef(null);
  const activeVerseRef = useRef(null);

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
  } = useStoreState((state) => state.navigator);

  const { baniLength, liveFeed, autoplayDelay, autoplayToggle, intelligentSpacebar, akhandpatt } =
    useStoreState((state) => state.userSettings);

  const {
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
  } = useStoreActions((actions) => actions.navigator);

  const updateTraversedVerse = (newTraversedVerse, verseIndex, crossPlatformId = null) => {
    if (isMiscSlide) {
      setIsMiscSlide(false);
    }
    // Ignoring flower verse to avoid unwanted scroll during asa di vaar
    if (newTraversedVerse === FLOWER_VERSE_ID) {
      return;
    }
    if (activePaneId !== currentPane) {
      setActivePaneId(currentPane);
    }
    changeVerse(newTraversedVerse, verseIndex, shabadId, {
      activeVerseId,
      setActiveVerseId,
      setActiveVerse,
      activeShabadId,
      setActiveShabadId,
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
    });
    udpateHistory(shabadId, newTraversedVerse, {
      verseHistory,
      setVerseHistory,
      setPaneAttributes,
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

  const updateHomeVerse = (verseIndex) => {
    changeHomeVerse(verseIndex, { paneAttributes, setPaneAttributes });
  };

  const setVerseList = (verseList) => {
    if (verseList.length) {
      // eslint-disable-next-line no-console
      if (baniType === 'ceremony' && verseList[0]) {
        try {
          const raw = verseList[0].toJSON ? verseList[0].toJSON() : verseList[0];
          // eslint-disable-next-line no-console
          console.log('[CTRL-DIAG rawCeremony] keys=', Object.keys(raw), 'sample=', JSON.stringify(raw).slice(0, 600));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('[CTRL-DIAG rawCeremony] dump failed', e && e.message);
        }
      }
      setRawVerses(verseList);
      saveToHistory(
        shabadId,
        verseList,
        baniType,
        { verseHistory, setVerseHistory, baniLength },
        initialVerseId,
      );
      const filtered = filterRequiredVerseItems(verseList);
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
      loadShabad(shabadId).then(setVerseList);
    } else if (baniType === 'bani') {
      loadBani(shabadId, baniLengthCols[baniLength]).then(setVerseList);
    } else if (baniType === 'ceremony') {
      loadCeremony(shabadId).then(setVerseList);
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
        setActiveVerse({ [activeVerseIndex]: activeVerseId });
      }
      if (
        (activeShabadId === null && sundarGutkaBaniId === null && ceremonyId === null) ||
        (initialVerseIndex >= 0 && Object.keys(activeVerse).length === 0)
      ) {
        updateTraversedVerse(initialVerseId, initialVerseIndex);
      }
    }
  }, [filteredItems]);

  useEffect(() => {
    // Bani/ceremony verse sync from a controller. A native (mobile) controller
    // sends the Realm crossPlatformId; the web controller has no crossPlatformId,
    // so it sends the BaniDB-global verseId. Match either, so both drive the
    // display to the right verse (without this, web-controller verse changes on
    // banis/ceremonies never matched and were silently dropped).
    if (savedCrossPlatformId == null) return;
    let baniVerseIndex = filteredItems.findIndex(
      (obj) =>
        obj.crossPlatformId === savedCrossPlatformId ||
        obj.verseId === savedCrossPlatformId,
    );
    // Ceremony fallback: ceremony verses carry Realm-local IDs with no
    // crossPlatformID, so the web controller's global BaniDB verseId never
    // matches by id (matchIdx stays -1). Both the web and desktop verse lists
    // are ordered by the ceremony's Seq, so resolve the verse by the 1-based
    // line position the web sends (recorded as lineNumber). Only when the id
    // match fails, so bani/shabad — which do match by id — are untouched.
    if (
      baniVerseIndex < 0 &&
      baniType === 'ceremony' &&
      lineNumber != null &&
      lineNumber - 1 >= 0 &&
      lineNumber - 1 < filteredItems.length
    ) {
      baniVerseIndex = lineNumber - 1;
    }
    // eslint-disable-next-line no-console
    console.log('[CTRL-DIAG match] baniType=', baniType, 'savedCrossPlatformId=', savedCrossPlatformId, 'lineNumber=', lineNumber, 'resolvedIdx=', baniVerseIndex, 'sample=', JSON.stringify(filteredItems.slice(0, 4).map((o) => ({ verseId: o.verseId, cp: o.crossPlatformId, ID: o.ID }))));
    if (baniVerseIndex >= 0) {
      const matched = filteredItems[baniVerseIndex];
      // Pass `verseId` (the verse's real id), NOT `ID` (the filtered array
      // index). `activeVerseId` drives `filterOverlayVerseItems(rawVerses, …)`
      // for the projected `show-line`, which matches `obj.ID === activeVerseId`
      // — with the array index it matched nothing and projected an empty verse,
      // so the display never moved for controller-driven bani/ceremony changes.
      updateTraversedVerse(matched.verseId, baniVerseIndex);
      // Highlighting alone doesn't move the virtualized list — scroll the
      // presenter view to the matched verse so the display actually changes.
      scrollToVerse(matched.verseId, filteredItems, virtuosoRef);
    }
    // `filteredItems` is a dep so a verse that arrives after the bani finishes
    // loading (the transient `matchIdx = -1` case) is picked up on the next
    // render. Safe because a new bani clears savedCrossPlatformId to null (guard
    // above), so this never re-applies a stale verse to a freshly-loaded bani.
    // `lineNumber` is a dep so a ceremony verse change that only moves the line
    // position (same savedCrossPlatformId space) still re-resolves by position.
  }, [savedCrossPlatformId, filteredItems, lineNumber]);

  useEffect(() => {
    const overlayVerse = filterOverlayVerseItems(rawVerses, activeVerseId);
    ipcRenderer.send(
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

  const getVerse = (direction) => {
    let verseIndex = null;
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
          setShortcuts({
            ...shortcuts,
            nextShabad: true,
            nextVerse: false,
          });
        }
        setShortcuts({
          ...shortcuts,
          nextVerse: false,
        });
      }
      if (shortcuts.prevVerse) {
        const prevVerse = getVerse('prev');
        if (prevVerse) {
          updateTraversedVerse(prevVerse.verseId, prevVerse.verseIndex);
          scrollToVerse(prevVerse.verseId, filteredItems, virtuosoRef);
        }
        setShortcuts({
          ...shortcuts,
          prevVerse: false,
        });
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
        setShortcuts({
          ...shortcuts,
          homeVerse: false,
        });
      }
      if (shortcuts.copyToClipboard) {
        copyToClipboard(activeVerseRef);
        setShortcuts({
          ...shortcuts,
          copyToClipboard: false,
        });
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    const milisecondsDelay = parseInt(autoplayDelay, 10) * 1000;
    const interval = setInterval(() => {
      if (autoplayToggle) {
        setShortcuts({
          ...shortcuts,
          nextVerse: true,
        });
      }
    }, milisecondsDelay);
    return () => {
      clearInterval(interval);
    };
  }, [autoplayToggle, autoplayDelay]);

  return (
    <div className="shabad-list">
      <div className="verse-block">
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
                updateTraversedVerse={updateTraversedVerse}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

ShabadText.propTypes = {
  shabadId: PropTypes.number,
  initialVerseId: PropTypes.number,
  baniType: PropTypes.string,
  paneAttributes: PropTypes.object,
  setPaneAttributes: PropTypes.func,
  currentPane: PropTypes.number,
};
