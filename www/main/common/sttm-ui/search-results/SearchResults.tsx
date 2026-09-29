import React from 'react';
import anvaad from 'anvaad-js';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { i18n } from '../../main-app';
import { useAppSelector } from '../../store/redux/hooks';
import Icon from '../icon';

type SearchResultsProps = {
  ang?: number;
  /** Opens the shabad at the verse, in the given pane. */
  onClick: (shabadId: number, verseId: number, verse: string, paneId: number) => void;
  searchType: number;
  raag?: string | null;
  shabadId: number;
  sourceId?: string;
  searchQuery: string;
  verse: string;
  verseId: number;
  writer?: string;
  currentLanguage?: string;
};

const SearchResults = ({
  ang,
  onClick,
  searchType,
  raag,
  shabadId,
  sourceId,
  searchQuery,
  verse,
  verseId,
  writer,
  currentLanguage,
}: SearchResultsProps) => {
  const { currentWorkspace, defaultPaneId } = useAppSelector((state) => state.userSettings);
  const { pane1, pane2, pane3 } = useAppSelector((state) => state.navigator);

  const getClassForAng = (baniSource?: string) => {
    if (baniSource === 'G') {
      return 'search-result__ang--sggs';
    }
    if (baniSource === 'D') {
      return 'search-result__ang--sdg';
    }
    if (baniSource === 'A') {
      return 'search-result__ang--ak';
    }
    return 'search-result__ang--other';
  };

  const getBorderColorClass = (baniSource?: string) => {
    if (baniSource === 'G') {
      return 'search-result__body--sggs';
    }
    if (baniSource === 'D') {
      return 'search-result__body--sdg';
    }
    if (baniSource === 'A') {
      return 'search-result__body--ak';
    }
    return 'search-result__body--other';
  };

  const shabadPaneButtons = () => {
    if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
      return (
        <div className="search-result__pane-buttons">
          <PrimaryButton
            className="search-result__pane-button search-result__pane-button--pane-1"
            mode="icon"
            size="xs"
            disabled={pane1.locked}
            onClick={() => {
              if (!pane1.locked) onClick(shabadId, verseId, verse, 1);
            }}
          >
            {pane1.locked ? <Icon name="lock" /> : '1'}
          </PrimaryButton>
          <PrimaryButton
            className="search-result__pane-button search-result__pane-button--pane-2"
            mode="icon"
            size="xs"
            disabled={pane2.locked}
            onClick={() => {
              if (!pane2.locked) onClick(shabadId, verseId, verse, 2);
            }}
          >
            {pane2.locked ? <Icon name="lock" /> : '2'}
          </PrimaryButton>
          <PrimaryButton
            className="search-result__pane-button search-result__pane-button--pane-3"
            mode="icon"
            size="xs"
            disabled={pane3.locked}
            onClick={() => {
              if (!pane3.locked) onClick(shabadId, verseId, verse, 3);
            }}
          >
            {pane3.locked ? <Icon name="lock" /> : '3'}
          </PrimaryButton>
        </div>
      );
    }
    return null;
  };

  const isHighlightRequired = (
    gurbaniVerse: string,
    word: string,
    wordIndex: number,
    searchCharacters: string,
  ) => {
    const wordsToHightlight = searchCharacters.length;
    const mainLetters = anvaad.mainLetters(gurbaniVerse);
    const firstLetters = mainLetters
      .split(' ')
      .map((d) => d[0])
      .join('');
    const queryStart = firstLetters.indexOf(searchCharacters);
    const queryEnd = queryStart + searchCharacters.length;
    switch (searchType) {
      // searchType value 0 represents First letter (start) option
      case 0:
        if (wordsToHightlight > wordIndex) {
          return true;
        }
        break;

      // searchType value 1 represents First Letter (anywhere) option
      case 1:
        if (wordIndex >= queryStart && wordIndex < queryEnd) {
          return true;
        }
        break;

      // searchType value 2 represents Full Word(s) option
      case 2:
        if (word.includes(searchCharacters)) {
          return true;
        }
        break;

      default:
        return false;
    }
    return false;
  };

  const highlightKeywords = (gurbaniVerse: string, searchCharacters: string) => {
    if (gurbaniVerse) {
      const brokenWords = gurbaniVerse.split(' ');
      return brokenWords.map((word, index) => (
        <span
          key={index}
          className={`search-result__word ${
            isHighlightRequired(gurbaniVerse, word, index, searchCharacters)
              ? 'search-result__word--match'
              : ''
          }`}
        >
          {word}
        </span>
      ));
    }
    return gurbaniVerse;
  };

  return (
    <li className="search-result">
      <div
        onClick={() => onClick(shabadId, verseId, verse, defaultPaneId)}
        className={`search-result__body ${getBorderColorClass(sourceId)}`}
      >
        <a className="search-result__text">
          {!!ang && (
            <span className={`search-result__ang ${getClassForAng(sourceId)}`}>{`${i18n.t(
              `SEARCH.ANG`,
            )} ${ang} `}</span>
          )}
          <span className="gurmukhi">{highlightKeywords(verse, searchQuery)}</span>
          {currentLanguage === 'en' && (
            <div className="search-result__translit">{anvaad.translit(verse)}</div>
          )}
          <div className="search-result__meta">
            {`${writer}${writer && raag ? ', ' : ' '}${raag !== null ? raag : ''}`}
          </div>
        </a>
      </div>
      {shabadPaneButtons()}
    </li>
  );
};

export default SearchResults;
