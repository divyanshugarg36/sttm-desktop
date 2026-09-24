import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { SearchBar } from '@khalisfoundation/sikhi-ui';

import { InputContext } from '../../../launchpad';
import {
  setCurrentWriter,
  setCurrentRaag,
  setCurrentSource,
  setShortcuts,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

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

  // Space is the next-verse shortcut, so word searches add it themselves.
  const handleKeyDown = (event) => {
    if (event.keyCode === 32 && [2, 3].includes(currentSearchType)) {
      setQuery(`${query} `);
    }
  };

  const values = {
    query,
    source: currentSource,
    writer: currentWriter,
    raag: currentRaag,
  };

  const handleChange = (next) => {
    if (next.query !== query) {
      setQuery(next.query || '');
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
      filters={{
        source: {
          label: 'Source',
          options: toOptions(sourceArray),
          defaultValue: 'all',
          position: 'left',
        },
        // 'left' filters always show as dropdowns, so there is no Filters button to open.
        writer: {
          label: 'Writer',
          options: toOptions(writerArray),
          defaultValue: 'all',
          position: 'left',
        },
        raag: {
          label: 'Raag',
          options: toOptions(raagArray),
          defaultValue: 'all',
          position: 'left',
        },
      }}
      onChange={handleChange}
      // Results update as you type, so Enter / the search button have nothing extra to do.
      onSearch={() => {}}
      enableKeyboard={isGurmukhi}
      isGurmukhi={isGurmukhi}
      showMatras={currentSearchType === 2}
      onMicClick={onMicClick}
      isRecording={isRecording}
      isProcessing={isProcessing}
      stream={stream}
      inputProps={{
        ref: inputRef,
        // mousetrap: the app's keyboard shortcuts still fire while typing here.
        className: `sui-search-bar__input mousetrap ${isGurmukhi ? 'gurmukhi' : 'english'}`,
        disabled,
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
