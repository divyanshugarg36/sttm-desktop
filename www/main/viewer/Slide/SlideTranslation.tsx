import React, { useState, useEffect } from 'react';
import { useViewerSelector } from '../store/hooks';
import type { GetFontSize, VerseTranslations } from '../types';

type SlideTranslationProps = {
  getFontSize: GetFontSize;
  translationObj?: VerseTranslations;
  /** A custom line's English, as HTML (shown instead of translationObj's). */
  translationHTML?: string;
  lang?: string;
  /** Which content line (0–2) the translation is on, for its font size. */
  position?: number;
};

const SlideTranslation = ({
  getFontSize,
  translationObj,
  translationHTML,
  lang,
  position,
}: SlideTranslationProps) => {
  const { content1FontSize, content2FontSize, content3FontSize, translationEnglishSource } =
    useViewerSelector((state) => state.userSettings);
  const [translationString, setTranslationString] = useState<string | null | undefined>(null);
  const fontSizes = [content1FontSize, content2FontSize, content3FontSize];

  const getTranslation = (translations: VerseTranslations) => {
    switch (lang) {
      case 'translation-english':
        setTranslationString(translations.en[translationEnglishSource]);
        break;
      case 'translation-spanish':
        setTranslationString(translations.es.sn);
        break;
      case 'translation-hindi':
        setTranslationString((translations.hi && translations.hi.ss) || null);
        break;
      default:
        setTranslationString(null);
        break;
    }
  };

  useEffect(() => {
    if (translationObj) {
      getTranslation(translationObj);
    }
  }, [translationObj, lang, translationEnglishSource]);

  let translationMarkup;

  // The custom-English line has no position: its font size is undefined.
  const customStyle = getFontSize(fontSizes[position as number]);

  if (translationHTML) {
    translationMarkup = (
      <div
        className={`slide-translation custom-english`}
        style={customStyle}
        dangerouslySetInnerHTML={{ __html: translationHTML }}
      />
    );
  } else if (translationString) {
    translationMarkup = (
      <div className={`slide-translation`} style={customStyle}>
        {translationString}
      </div>
    );
  } else {
    translationMarkup = <div className={`slide-translation`} style={customStyle}></div>;
  }

  return translationMarkup;
};

export default SlideTranslation;
