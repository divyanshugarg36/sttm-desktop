import React from 'react';
import { useViewerSelector } from '../store/hooks';
import type { GetFontSize, VishraamPlacement } from '../types';

/** A word of the line, with its visraam type (from the active source) if it has one. */
type PankteeWord = {
  text: string;
  vishraamType?: string | null;
};

const bakePanktee = () => {
  const { displayVishraams, larivaarAssist, larivaar, gurbaniFontSize } = useViewerSelector(
    (state) => state.userSettings,
  );

  return (
    getFontSize: GetFontSize,
    vishraamPlacement: VishraamPlacement,
    vishraamSource: string,
    gurmukhiString = '',
  ) => {
    const filterAppliedVishraam = () => {
      const activeVishraams: Record<number, string> = {};
      if (vishraamPlacement) {
        Object.keys(vishraamPlacement).forEach((appliedVishraam) => {
          if (vishraamSource === appliedVishraam) {
            const rawActiveVishraams = vishraamPlacement[appliedVishraam];
            if (rawActiveVishraams && rawActiveVishraams.length > 0) {
              rawActiveVishraams.forEach((rav) => {
                activeVishraams[rav.p] = rav.t;
              });
            }
          }
        });
      }
      return activeVishraams;
    };

    const breakIntoWords = (fullLine: string) => {
      let wordsObj: PankteeWord[] = [];
      const splittedWords = fullLine.split(' ');
      const activeVishraams = filterAppliedVishraam();
      wordsObj = splittedWords.map((text, index) => {
        const wordObj: PankteeWord = { text };
        wordObj.vishraamType = activeVishraams[index] ? activeVishraams[index] : null;
        return wordObj;
      });
      return wordsObj;
    };

    const getVishraamStyle = (word: PankteeWord) => {
      if (larivaar && larivaarAssist) {
        return undefined;
      }
      return (
        (displayVishraams && word.vishraamType && `vishraam vishraam-${word.vishraamType}`) ||
        undefined
      );
    };

    const bakePankteeMarkup = () => {
      let customStyles;
      if (larivaar) {
        customStyles = getFontSize(gurbaniFontSize);
      } else {
        // adding custom styles here to reach chromecast
        customStyles = {
          ...getFontSize(gurbaniFontSize),
          display: 'inline-block',
          margin: '0 0.15em',
          whiteSpace: 'nowrap',
        } as const;
      }
      return breakIntoWords(gurmukhiString).map((word, i) => (
        <React.Fragment key={i}>
          <span className={getVishraamStyle(word)} style={customStyles}>
            {word.text}
          </span>
          <wbr />
        </React.Fragment>
      ));
    };

    return bakePankteeMarkup();
  };
};

export default bakePanktee;
