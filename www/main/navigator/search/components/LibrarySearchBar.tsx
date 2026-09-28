import React, { useContext, useEffect } from 'react';
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { SearchBar, type SearchBarValues } from '@khalisfoundation/sikhi-ui';

import { InputContext } from '../../../launchpad';
import { SEARCH_TYPES } from '../../../banidb/constants';
import {
  setCurrentLanguage,
  setCurrentSearchType,
  setCurrentWriter,
  setCurrentRaag,
  setCurrentSource,
  setShortcuts,
} from '../../../common/store/redux/navigatorSlice';
import { analytics, i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { FilterOption } from '../../utils';

// Every search type, in the web's order, with its label.
const searchTypes: [number, string][] = [
  [SEARCH_TYPES.FIRST_LETTERS, 'FIRST_LETTER_START'],
  [SEARCH_TYPES.FIRST_LETTERS_ANYWHERE, 'FIRST_LETTER_ANYWHERE'],
  [SEARCH_TYPES.FIRST_LETTERS_ENGLISH, 'FIRST_LETTER_ENGLISH'],
  [SEARCH_TYPES.MAIN_LETTERS, 'MAIN_LETTERS'],
  [SEARCH_TYPES.GURMUKHI_WORD, 'FULL_WORDS_GURMUKHI'],
  [SEARCH_TYPES.ENGLISH_WORD, 'FULL_WORDS_ENGLISH'],
  [SEARCH_TYPES.ANG, 'ANG'],
];

// Types searched with English input; the rest take Gurmukhi.
const englishSearchTypes: number[] = [
  SEARCH_TYPES.ENGLISH_WORD,
  SEARCH_TYPES.FIRST_LETTERS_ENGLISH,
];

type FilterKey = 'source' | 'writer' | 'raag';

const filterActions: Record<FilterKey, ActionCreatorWithPayload<string>> = {
  source: setCurrentSource,
  writer: setCurrentWriter,
  raag: setCurrentRaag,
};

const toOptions = (optionsArray: FilterOption[]) =>
  optionsArray.map((option) => ({ value: option.value, label: option.text }));

type LibrarySearchBarProps = {
  query: string;
  setQuery: (query: string) => void;
  placeholder: string;
  disabled: boolean;
  writerArray: FilterOption[];
  raagArray: FilterOption[];
  sourceArray: FilterOption[];
  /** Starts / stops voice search; the mic button only shows with it. */
  onMicClick?: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  stream: MediaStream | null;
  isMicDenied: boolean;
};

// sikhi-ui SearchBar for the search pane. It edits SearchContent's query and
// the navigator's source/writer/raag filters; the search itself runs in
// SearchContent. Gurmukhi queries stay in Gurbani Akhar, shown with the app's
// gurmukhi font. Its input is the launchpad's search input (InputContext):
// Ctrl+/ focuses it, and verse shortcuts are skipped while it has focus.
export const LibrarySearchBar = ({
  query,
  setQuery,
  placeholder,
  disabled,
  writerArray,
  raagArray,
  sourceArray,
  onMicClick,
  isRecording,
  isProcessing,
  stream,
  isMicDenied,
}: LibrarySearchBarProps) => {
  const {
    currentLanguage,
    currentSearchType,
    currentWriter,
    currentRaag,
    currentSource,
    searchQuery,
    shortcuts,
  } = useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();
  const inputRef = useContext(InputContext)!;
  const isGurmukhi = currentLanguage !== 'en';

  // Ctrl+/ (launchpad shortcut) focuses the search input.
  useEffect(() => {
    if (shortcuts.focusInput) {
      inputRef.current?.focus();
      dispatch(setShortcuts({ ...shortcuts, focusInput: false }));
    }
  }, [shortcuts]);

  // Space is the next-verse shortcut, so searches that take words add it
  // themselves.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.keyCode === 32 &&
      (
        [
          SEARCH_TYPES.GURMUKHI_WORD,
          SEARCH_TYPES.ENGLISH_WORD,
          SEARCH_TYPES.MAIN_LETTERS,
        ] as number[]
      ).includes(currentSearchType)
    ) {
      setQuery(`${query} `);
    }
  };

  const values: SearchBarValues & Record<FilterKey, string> = {
    query,
    type: String(currentSearchType),
    source: currentSource,
    writer: currentWriter,
    raag: currentRaag,
  };

  const handleSearchTypeChange = (value: string) => {
    const searchType = parseInt(value, 10);
    const language = englishSearchTypes.includes(searchType) ? 'en' : 'gr';
    dispatch(setCurrentSearchType(searchType));
    if (currentLanguage !== language) {
      dispatch(setCurrentLanguage(language));
    }
    analytics.trackEvent({
      category: 'search',
      action: 'search-type',
      label: value,
    });
  };

  // The language pill in the search bar. Each language starts on its first
  // letter search.
  const handleLanguageToggle = (toGurmukhi: boolean) => {
    const language = toGurmukhi ? 'gr' : 'en';
    const searchType = toGurmukhi ? SEARCH_TYPES.FIRST_LETTERS : SEARCH_TYPES.ENGLISH_WORD;
    if (currentSearchType !== searchType) {
      dispatch(setCurrentSearchType(searchType));
    }
    if (currentLanguage !== language) {
      dispatch(setCurrentLanguage(language));
    }
    analytics.trackEvent({
      category: 'search',
      action: 'language',
      label: language,
    });
  };

  const handleChange = (next: SearchBarValues) => {
    if (next.query !== query) {
      setQuery(next.query || '');
    }
    if (next.type !== undefined && next.type !== values.type) {
      handleSearchTypeChange(next.type);
    }
    (Object.keys(filterActions) as FilterKey[]).forEach((key) => {
      if (next[key] !== undefined && next[key] !== values[key]) {
        dispatch(filterActions[key](next[key]!));
        analytics.trackEvent({
          category: 'search',
          action: 'set-filter',
          label: key,
          value: next[key],
        });
      }
    });
  };

  return (
    <SearchBar
      className={`search-pane__bar ${isMicDenied ? 'search-pane__bar--mic-denied' : ''}`.trim()}
      wrapperVariant="gradient"
      placeholder={placeholder}
      values={values}
      // The search type always shows as a dropdown ('left'); source, writer
      // and raag sit behind the Filters button ('right').
      filters={{
        type: {
          options: searchTypes.map(([value, label]) => ({
            value: String(value),
            label: i18n.t(`SEARCH.${label}`),
          })),
          defaultValue: String(SEARCH_TYPES.FIRST_LETTERS),
          position: 'left',
        },
        source: {
          label: 'Source',
          options: toOptions(sourceArray),
          defaultValue: 'all',
          position: 'right',
        },
        writer: {
          label: 'Writer',
          options: toOptions(writerArray),
          defaultValue: 'all',
          position: 'right',
        },
        raag: {
          label: 'Raag',
          options: toOptions(raagArray),
          defaultValue: 'all',
          position: 'right',
        },
      }}
      onChange={handleChange}
      // Results update as you type, so Enter / the search button have nothing extra to do.
      onSearch={() => {}}
      // The keyboard toggle only shows in Gurmukhi; enableKeyboard also shows
      // the language pill, which is needed in English to switch back.
      enableKeyboard
      showLanguageToggle
      onLanguageToggle={handleLanguageToggle}
      isGurmukhi={isGurmukhi}
      showMatras={currentSearchType === SEARCH_TYPES.GURMUKHI_WORD}
      onMicClick={onMicClick}
      isRecording={isRecording}
      isProcessing={isProcessing}
      stream={stream}
      inputProps={
        {
          ref: inputRef,
          // mousetrap: the app's keyboard shortcuts still fire while typing here.
          className: `sui-search-bar__input mousetrap ${isGurmukhi ? 'gurmukhi' : 'english'}`,
          disabled,
          // Gurbani Akhar queries aren't English words.
          spellCheck: false,
          onKeyDown: handleKeyDown,
          onBlur: () =>
            analytics.trackEvent({
              category: 'search',
              action: 'physical keyboard search',
              value: searchQuery,
            }),
        } as React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
      }
    />
  );
};
