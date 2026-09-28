import React, { useState, useEffect } from 'react';
import { useViewerSelector } from '../store/hooks';
import type { GetFontSize, VerseTranslations } from '../types';

type SlideTeekaProps = {
  getFontSize: GetFontSize;
  teekaObj: VerseTranslations;
  /** Which content line (0–2) the teeka is on, for its font size. */
  position: number;
};

const SlideTeeka = ({ getFontSize, teekaObj, position }: SlideTeekaProps) => {
  const { content1FontSize, content2FontSize, content3FontSize, teekaSource } = useViewerSelector(
    (state) => state.userSettings,
  );
  const [teekaString, setTeekaString] = useState<string | null>(null);
  const fontSizes = [content1FontSize, content2FontSize, content3FontSize];

  const getTeeka = (inputTeeka: VerseTranslations) => {
    if (inputTeeka && inputTeeka.pu) {
      if (inputTeeka.pu[teekaSource]) {
        setTeekaString(inputTeeka.pu[teekaSource]);
      } else {
        setTeekaString(null);
      }
    }
  };

  useEffect(() => {
    getTeeka(teekaObj);
  }, [teekaObj, teekaSource]);

  const customStyle = getFontSize(fontSizes[position]);

  return (
    teekaString && (
      <div className="slide-teeka" style={customStyle}>
        {teekaString}
      </div>
    )
  );
};

export default SlideTeeka;
