import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { SearchBar } from '@khalisfoundation/sikhi-ui';

import {
  setCurrentWriter,
  setCurrentRaag,
  setCurrentSource,
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

// sikhi-ui SearchBar, rendered above the existing search input while it is
// being evaluated. It shares SearchContent's query (so both inputs stay in
// sync and the same search runs) and the navigator's source/writer/raag
// filters. Gurmukhi queries stay in Gurbani Akhar, shown with the app's
// gurmukhi font like the existing input.
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
}) => {
  const { currentLanguage, currentSearchType, currentWriter, currentRaag, currentSource } =
    useSelector((state) => state.navigator);
  const dispatch = useDispatch();
  const isGurmukhi = currentLanguage !== 'en';

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
      className="library-search-bar"
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
      inputProps={{
        className: `sui-search-bar__input ${isGurmukhi ? 'gurmukhi' : ''}`.trim(),
        disabled,
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
};
