import React, { useState, useEffect } from 'react';
import anvaad from 'anvaad-js';
import { useViewerSelector } from '../store/hooks';
import type { GetFontSize } from '../types';

type SlideTransliterationProps = {
  getFontSize: GetFontSize;
  gurmukhiString: string;
  lang: string;
  /** Which content line (0–2) the transliteration is on, for its font size. */
  position: number;
};

const SlideTransliteration = ({
  getFontSize,
  gurmukhiString,
  lang,
  position,
}: SlideTransliterationProps) => {
  const { content1FontSize, content2FontSize, content3FontSize } = useViewerSelector(
    (state) => state.userSettings,
  );
  const fontSizes = [content1FontSize, content2FontSize, content3FontSize];
  const [transliterationString, setTransliterationString] = useState<string | null>(null);

  const getTransliteration = (gurmukhi: string) => {
    switch (lang) {
      case 'transliteration-english':
        setTransliterationString(anvaad.translit(gurmukhi));
        break;
      case 'transliteration-punjabi':
        setTransliterationString(anvaad.translit(gurmukhi || '', 'shahmukhi'));
        break;
      case 'transliteration-hindi':
        setTransliterationString(anvaad.translit(gurmukhi || '', 'devnagri'));
        break;
      default:
        setTransliterationString(null);
        break;
    }
  };

  useEffect(() => {
    getTransliteration(gurmukhiString);
  }, [gurmukhiString, lang]);

  const customStyle = getFontSize(fontSizes[position]);

  return (
    transliterationString && (
      <div className={`slide-transliteration`} style={customStyle}>
        {transliterationString}
      </div>
    )
  );
};

export default SlideTransliteration;
