import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { SearchBar } from '@khalisfoundation/sikhi-ui';

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

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');
const { i18n } = remote.require('./app');

// Every search type, in the web's order, with its label.
const searchTypes = [
  [SEARCH_TYPES.FIRST_LETTERS, 'FIRST_LETTER_START'],
  [SEARCH_TYPES.FIRST_LETTERS_ANYWHERE, 'FIRST_LETTER_ANYWHERE'],
  [SEARCH_TYPES.FIRST_LETTERS_ENGLISH, 'FIRST_LETTER_ENGLISH'],
  [SEARCH_TYPES.MAIN_LETTERS, 'MAIN_LETTERS'],
  [SEARCH_TYPES.GURMUKHI_WORD, 'FULL_WORDS_GURMUKHI'],
  [SEARCH_TYPES.ENGLISH_WORD, 'FULL_WORDS_ENGLISH'],
  [SEARCH_TYPES.ANG, 'ANG'],
];

// Types searched with English input; the rest take Gurmukhi.
const englishSearchTypes = [SEARCH_TYPES.ENGLISH_WORD, SEARCH_TYPES.FIRST_LETTERS_ENGLISH];

const filterActions = {
  source: setCurrentSource,
  writer: setCurrentWriter,
  raag: setCurrentRaag,
};

const toOptions = (optionsArray) =>
  optionsArray.map((option) => ({ value: option.value, label: option.text }));

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
}) => {
  const {
    currentLanguage,
    currentSearchType,
    currentWriter,
    currentRaag,
    currentSource,
    searchQuery,
    shortcuts,
  } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();
  const inputRef = useContext(InputContext);
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
  const handleKeyDown = (event) => {
    if (
      event.keyCode === 32 &&
      [SEARCH_TYPES.GURMUKHI_WORD, SEARCH_TYPES.ENGLISH_WORD, SEARCH_TYPES.MAIN_LETTERS].includes(
        currentSearchType,
      )
    ) {
      setQuery(`${query} `);
    }
  };

  const values = {
    query,
    type: String(currentSearchType),
    source: currentSource,
    writer: currentWriter,
    raag: currentRaag,
  };

  const handleSearchTypeChange = (value) => {
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
  const handleLanguageToggle = (toGurmukhi) => {
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

  const handleChange = (next) => {
    if (next.query !== query) {
      setQuery(next.query || '');
    }
    if (next.type !== undefined && next.type !== values.type) {
      handleSearchTypeChange(next.type);
    }
    Object.keys(filterActions).forEach((key) => {
      if (next[key] !== undefined && next[key] !== values[key]) {
        dispatch(filterActions[key](next[key]));
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
      className={`library-search-bar ${isMicDenied ? 'mic-denied' : ''}`.trim()}
      wrapperVariant="default"
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
      inputProps={{
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
      }}
    />
  );
};

LibrarySearchBar.propTypes = {
  query: PropTypes.string,
  setQuery: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  writerArray: PropTypes.array,
  raagArray: PropTypes.array,
  sourceArray: PropTypes.array,
  onMicClick: PropTypes.func,
  isRecording: PropTypes.bool,
  isProcessing: PropTypes.bool,
  stream: PropTypes.object,
  isMicDenied: PropTypes.bool,
};
