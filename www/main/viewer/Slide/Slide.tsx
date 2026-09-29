import React, { useMemo } from 'react';
import {
  PresenterSlide,
  type PresenterLine,
  type PresenterSlideClassNames,
  type PresenterSlideSettings,
  type PresenterTranslations,
  type PresenterVisraams,
} from '@khalisfoundation/sikhi-ui';

import { sendToMain } from '../../common/ipc';
import { useViewerSelector } from '../store/hooks';
import type { NextLine, SlideLine } from '../types';

type SlideProps = {
  /** The line to show; none on an empty slide. */
  verseObj?: SlideLine | null;
  nextLineObj?: NextLine | null;
  isMiscSlide: boolean;
  /** The empty slide's overlay colour (unused). */
  bgColor?: string;
  /** Registers the line's element, so Akhand Paatth can scroll to it. */
  updateVerseRef?: (verseId: number | null, ref: HTMLDivElement | null) => void;
  slideIndex?: number;
};

// The class names the slide had before it moved to sikhi-ui, kept next to the
// library's: the chromecast receiver gets the slide's HTML and styles these.
const LEGACY_CLASS_NAMES: PresenterSlideClassNames = {
  slide: 'verse-slide',
  gurbani: 'slide-gurbani',
  translation: 'slide-translation',
  customEnglish: 'custom-english',
  teeka: 'slide-teeka',
  transliteration: 'slide-transliteration',
  nextLine: 'slide-next-line',
  announcement: 'slide-announcement',
  larivaar: 'larivaar',
  padchhed: 'padchhed',
  visraamWord: 'vishraam',
};

const parseJson = <T,>(json: string | null | undefined): T | undefined =>
  json ? (JSON.parse(json) as T) : undefined;

/** A line from the database (visraams and translations as JSON) for the slide. */
const toPresenterLine = (line: SlideLine): PresenterLine => ({
  id: line.ID,
  gurmukhi: line.Gurmukhi,
  visraams: parseJson<PresenterVisraams>(line.Visraam),
  translations: parseJson<PresenterTranslations>(line.Translations),
  english: line.English,
});

const Slide = React.memo(({ verseObj, nextLineObj, isMiscSlide, updateVerseRef }: SlideProps) => {
  const userSettings = useViewerSelector((state) => state.userSettings);
  const { activeVerseId, isMiscSlideGurmukhi, miscSlideText, isAnnouncement } = useViewerSelector(
    (state) => state.navigator,
  );

  // Stable per line: the slide treats a new line object as a line change.
  const line = useMemo(() => (verseObj ? toPresenterLine(verseObj) : null), [verseObj]);
  const nextLine = useMemo(
    () =>
      nextLineObj?.Gurmukhi
        ? {
            gurmukhi: nextLineObj.Gurmukhi,
            visraams: parseJson<PresenterVisraams>(nextLineObj.Visraam),
          }
        : null,
    [nextLineObj],
  );

  const { akhandpatt } = userSettings;
  const settings: PresenterSlideSettings = {
    gurbaniFontSize: userSettings.gurbaniFontSize,
    announcementFontSize: userSettings.announcementsFontSize,
    content: [
      {
        type: userSettings.content1,
        visible: userSettings.content1Visibility,
        fontSize: userSettings.content1FontSize,
      },
      {
        type: userSettings.content2,
        visible: userSettings.content2Visibility,
        fontSize: userSettings.content2FontSize,
      },
      {
        type: userSettings.content3,
        visible: userSettings.content3Visibility,
        fontSize: userSettings.content3FontSize,
      },
    ],
    larivaar: userSettings.larivaar,
    larivaarAssist: userSettings.larivaarAssist,
    larivaarAssistType: userSettings.larivaarAssistType,
    displayVisraams: userSettings.displayVishraams,
    visraamSource: userSettings.vishraamSource,
    visraamType: userSettings.vishraamType,
    leftAlign: userSettings.leftAlign,
    displayNextLine: userSettings.displayNextLine,
    transitions: userSettings.slideTransitions,
    translationEnglishSource: userSettings.translationEnglishSource,
    teekaSource: userSettings.teekaSource,
  };

  const castToReceiver = () => sendToMain('cast-to-receiver');

  if (isMiscSlide) {
    return (
      <div className="verse-slide-wrapper">
        <PresenterSlide
          // Only a controller's text slide says whether it's Gurmukhi; the
          // app's own misc slides are.
          announcement={{
            text: miscSlideText,
            isGurmukhi: isAnnouncement ? isMiscSlideGurmukhi : true,
          }}
          settings={settings}
          onShown={castToReceiver}
          classNames={LEGACY_CLASS_NAMES}
        />
      </div>
    );
  }

  if (!verseObj || !line) return null;

  return (
    <PresenterSlide
      ref={(el) => {
        updateVerseRef?.(verseObj.ID, el);
      }}
      id={`verse-${verseObj.ID}`}
      data-verseid={verseObj.ID}
      line={line}
      nextLine={nextLine}
      settings={settings}
      continuous={akhandpatt}
      isActive={activeVerseId === verseObj.ID}
      onShown={castToReceiver}
      classNames={{
        ...LEGACY_CLASS_NAMES,
        wrapper: akhandpatt ? undefined : 'verse-slide-wrapper',
        gurbani: [
          'slide-gurbani',
          userSettings.larivaarAssist &&
            (userSettings.larivaarAssistType === 'single-color'
              ? 'larivaar-assist-single-color'
              : 'larivaar-assist-multi-color'),
          userSettings.vishraamType === 'colored-words' ? 'vishraam-colored' : 'vishraam-gradient',
          activeVerseId === verseObj.ID && 'active-viewer-verse',
        ]
          .filter(Boolean)
          .join(' '),
      }}
    />
  );
});

Slide.displayName = 'Slide';

export default Slide;
