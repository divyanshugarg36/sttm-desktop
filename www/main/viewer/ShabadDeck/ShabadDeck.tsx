import React, { useState, useEffect, useRef } from 'react';
import os from 'os';

import Slide from '../Slide/Slide';
import { setFilteredBaniOptions } from '../../common/store/redux/navigatorSlice';
import QuickTools from '../Slide/QuickTools';

import {
  loadShabadVerse,
  loadBaniVerse,
  loadBani,
  loadCeremony,
  loadShabad,
} from '../../navigator/utils';
import ViewerIcon from '../icons/ViewerIcon';
import PaddingTools from '../Slide/PaddingTools';
import AutoPlayIcon from '../Slide/AutoPlayIcon';
import { BASE_BANI_OPTIONS } from '../../banidb/constants';
import themes from '../../../configs/themes.json';
import { i18n } from '../../common/main-app';
import { sendGlobalSetting } from '../../common/ipc';
import type { ThemeBg } from '../../common/store/redux/userSettingsSlice';
import { useViewerDispatch, useViewerSelector } from '../store/hooks';
import type { NextLine, SlideLine, VerseTranslations } from '../types';

const platform = os.platform();

/** A theme from www/configs/themes.json. */
type ThemeJson = (typeof themes)[number];

function ShabadDeck() {
  const {
    activeShabadId,
    activePaneId,
    activeVerseId,
    isMiscSlide,
    miscSlideText,
    sundarGutkaBaniId,
    isSundarGutkaBani,
    ceremonyId,
    isCeremonyBani,
    minimizedBySingleDisplay,
    pane1,
    pane2,
    pane3,
    filteredBaniOptions,
  } = useViewerSelector((state) => state.navigator);

  const dispatch = useViewerDispatch();

  const {
    theme: currentTheme,
    akhandpatt,
    baniLength,
    displayNextLine,
    themeBg,
    currentWorkspace,
    defaultPaneId,
    teekaSource,
    translationEnglishSource,
  } = useViewerSelector((state) => state.userSettings);
  const { containerPadding } = useViewerSelector((state) => state.viewerSettings);
  const [activeVerse, setActiveVerse] = useState<(SlideLine | null)[]>([]);
  const [nextVerse, setNextVerse] = useState<NextLine | null | undefined>({});
  const verseRefKeys = useRef<(number | null)[]>([]);

  const baniLengthCols = {
    short: 'existsSGPC',
    medium: 'existsMedium',
    long: 'existsTaksal',
    extralong: 'existsBuddhaDal',
  };

  const verseRefs = useRef<Record<string, HTMLDivElement>>({});

  const updateVerseRef = (verseId: number | null, ref: HTMLDivElement | null) => {
    if (ref) {
      verseRefs.current[String(verseId)] = ref;
      if (!verseRefKeys.current.includes(verseId)) {
        verseRefKeys.current = [...verseRefKeys.current, verseId];
      }
    }
  };

  // The current theme is always one of the list's.
  const getCurrentThemeInstance = () => themes.find((theme) => theme.key === currentTheme)!;

  const bakeThemeStyles = (themeInstance: ThemeJson, themeObj: ThemeBg) => {
    // No background (false) has no type or url.
    const { type: bgType, url: bgUrl } = themeObj || { type: undefined, url: undefined };
    const backgroundImageObj =
      bgType === 'default'
        ? {
            backgroundImage: `url('assets/img/custom_backgrounds/${themeInstance['background-image-full']}')`,
          }
        : {
            backgroundImage: `url('${bgUrl}')`,
          };
    const backgroundColorObj = {
      backgroundColor: themeInstance['background-color'],
    };
    return themeInstance['background-image-full'] || bgType === 'custom'
      ? backgroundImageObj
      : backgroundColorObj;
  };

  const applyTheme = () => {
    const themeInstance = getCurrentThemeInstance();
    return bakeThemeStyles(themeInstance, themeBg);
  };

  const applyOverlay = () => {
    const themeInstance = getCurrentThemeInstance();
    if (themeBg && themeBg.type === 'video') {
      return themeInstance['background-color'];
    }
    return '';
  };

  const bakeEmptyVerse = (): NextLine => ({
    Gurmukhi: '',
    Visraam: '',
  });

  const getFilteredBaniOptions = () => {
    if (!activeVerse.length) return BASE_BANI_OPTIONS;

    try {
      // A null line throws here, and a custom line (no Translations) in JSON.parse.
      const translations = JSON.parse(activeVerse[0]!.Translations!) as Partial<VerseTranslations>;

      const visibilityMap: Record<string, unknown> = {
        'teeka-punjabi': translations?.pu?.[teekaSource]?.length,
        'translation-english': translations?.en?.[translationEnglishSource]?.length,
        'translation-hindi': translations?.hi?.ss?.length,
        'translation-spanish': translations?.es?.sn?.length,
        'transliteration-english': true,
        'transliteration-hindi': true,
      };

      return BASE_BANI_OPTIONS.map((group) => ({
        ...group,
        options: group.options.filter((option) => visibilityMap[option.id]),
      }));
    } catch {
      return BASE_BANI_OPTIONS;
    }
  };

  const classNames = (...classes: (string | false)[]) => classes.filter(Boolean).join(' ');

  useEffect(() => {
    let currentShabad = activeShabadId;
    if (!currentShabad) {
      const activePane = activePaneId || defaultPaneId;
      if (activePane === 1) {
        currentShabad = pane1.activeShabad;
      } else if (activePane === 2) {
        currentShabad = pane2.activeShabad;
      } else if (activePane === 3) {
        currentShabad = pane3.activeShabad;
      }
    }
    // A bani or ceremony has its own lookup below. Its line ids (1, 2, 3, …)
    // aren't verse ids, so looking them up in the pane's "shabad" (the bani
    // id) showed that shabad's verses instead, e.g. Japji Sahib's for Gur
    // Mantar (bani 1 → shabad 1).
    const isShabadShown = !isSundarGutkaBani && !isCeremonyBani;
    if (!isMiscSlide && activeVerseId && isShabadShown) {
      if (akhandpatt) {
        // loadShabad takes just the shabad (the verse was an unused argument).
        loadShabad(currentShabad!).then((verses) => setActiveVerse(verses!));
      } else {
        loadShabadVerse(currentShabad!, activeVerseId).then((result) =>
          result!.map((activeRes) => setActiveVerse([activeRes])),
        );
        // load next line of searched shabad verse from db
        if (displayNextLine && !isMiscSlide) {
          loadShabadVerse(currentShabad!, activeVerseId, displayNextLine).then((result) => {
            if (result!.length) {
              result!.map((activeRes) => setNextVerse(activeRes));
            } else {
              setNextVerse(bakeEmptyVerse());
            }
          });
        }
      }
    }
    if (!isMiscSlide && sundarGutkaBaniId && isSundarGutkaBani) {
      if (akhandpatt) {
        // mangalPosition was removed from 3rd argument of loadBani
        loadBani(sundarGutkaBaniId, baniLengthCols[baniLength]).then((baniRows) => {
          setActiveVerse([...baniRows!]);
        });
      } else {
        // load current bani verse from db and set in the state
        loadBaniVerse(
          sundarGutkaBaniId,
          activeVerseId as number,
          baniLengthCols[baniLength],
          // mangalPosition,
        ).then((rows) => {
          if (rows!.length > 1) {
            setActiveVerse([rows![0]]);
          } else if (rows!.length === 1) {
            setActiveVerse([...rows!]);
          }
        });
        // load next line of bani
        if (displayNextLine && !isMiscSlide) {
          loadBaniVerse(
            sundarGutkaBaniId,
            activeVerseId as number,
            baniLengthCols[baniLength],
            displayNextLine,
            // mangalPosition,
          ).then((rows) => {
            if (rows!.length === 1) {
              setNextVerse(rows![0]);
            } else {
              setNextVerse(bakeEmptyVerse());
            }
          });
        }
      }
    }
    if (!isMiscSlide && ceremonyId && isCeremonyBani) {
      loadCeremony(ceremonyId).then((ceremonyVersesArray) => {
        let ceremonyVerses: (SlideLine | null)[] | undefined;
        try {
          ceremonyVerses = ceremonyVersesArray!.flat(1);
        } finally {
          const activeCeremonyVerse = ceremonyVerses!.filter((ceremonyVerse) => {
            if (ceremonyVerse && ceremonyVerse.ID === activeVerseId) {
              return true;
            }
            return false;
          });
          // filters next line of ceremony verse
          const nextCeremonyVerse = ceremonyVerses!.filter(
            (ceremonyVerse) => ceremonyVerse && ceremonyVerse.ID === (activeVerseId as number) + 1,
          );
          setNextVerse(nextCeremonyVerse[0]);
          if (akhandpatt) {
            setActiveVerse([...ceremonyVerses!]);
          } else {
            setActiveVerse([...activeCeremonyVerse]);
          }
        }
      });
    }
  }, [
    activeShabadId,
    activeVerseId,
    sundarGutkaBaniId,
    ceremonyId,
    akhandpatt,
    displayNextLine,
    isMiscSlide,
    pane1,
    pane2,
    pane3,
  ]);

  useEffect(() => {
    if (activeVerseId && akhandpatt) {
      const verseDOM = verseRefs.current[activeVerseId];

      if (verseDOM) {
        verseDOM.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeVerseId, akhandpatt, verseRefKeys.current]);

  useEffect(() => {
    if (isMiscSlide) {
      if (activeVerse.length !== 0) {
        setActiveVerse([]);
      }
    }
  }, [isMiscSlide]);

  useEffect(() => {
    const updatedOptions = getFilteredBaniOptions().filter((option) => option.options.length);
    dispatch(setFilteredBaniOptions(updatedOptions));
    sendGlobalSetting(`setFilteredBaniOptions`, updatedOptions, 'navigator');
  }, [activeVerse, setFilteredBaniOptions]);

  return (
    <>
      {activeVerse.length && akhandpatt ? <AutoPlayIcon /> : null}
      {themeBg && themeBg.type === 'video' && (
        <>
          <video className="video-preview" src={themeBg.url as string} autoPlay muted loop />
          <div className="video-overlay" style={{ background: applyOverlay() }} />
        </>
      )}
      <div
        className={classNames(
          'shabad-deck',
          currentWorkspace === i18n.t('WORKSPACES.SINGLE_DISPLAY') && 'single-display-mode',
          miscSlideText === '' && 'empty-slide',
          minimizedBySingleDisplay && 'single-display-minimized',
          akhandpatt && !isMiscSlide && 'akhandpatt-view',
          platform === 'win32' && 'win32',
          `theme-${getCurrentThemeInstance().key}`,
        )}
        style={applyTheme()}
      >
        {!minimizedBySingleDisplay && (
          <QuickTools
            isMiscSlide={isMiscSlide}
            baniOptions={filteredBaniOptions.length ? filteredBaniOptions : BASE_BANI_OPTIONS}
          />
        )}
        {!minimizedBySingleDisplay && !akhandpatt && <PaddingTools />}
        <div
          id="viewer-container-slide-wrapper"
          style={{
            padding: `${containerPadding.top}px ${containerPadding.right}px ${containerPadding.bottom}px ${containerPadding.left}px`,
          }}
        >
          {activeVerse.length ? (
            activeVerse.map((activeVerseObj, index) => (
              <Slide
                key={index}
                verseObj={activeVerseObj}
                nextLineObj={nextVerse}
                isMiscSlide={isMiscSlide}
                updateVerseRef={updateVerseRef}
                slideIndex={index}
              />
            ))
          ) : (
            <Slide isMiscSlide={isMiscSlide} bgColor={applyOverlay()} />
          )}
        </div>
      </div>
      <ViewerIcon className="viewer-logo" />
    </>
  );
}

export default ShabadDeck;
