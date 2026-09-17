import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { searchShabads, loadAng } from '../../../navigator/utils';
import { InputContext } from '../../../launchpad';
import { setSearchData, setShortcuts } from '../../store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

const InputBox = ({ placeholder, disabled, className, databaseProgress, query, setQuery }) => {
  const { currentSearchType, currentSource, searchQuery, shortcuts } = useSelector(
    (state) => state.navigator,
  );
  const dispatch = useDispatch();

  const inputContextRef = useContext(InputContext);
  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSpace = (event) => {
    if (event.keyCode === 32 && [2, 3].includes(currentSearchType)) {
      setQuery(`${query} `);
    }
  };

  // keyboard shortcut to focus on search input
  const focusInputbox = () => {
    inputContextRef.current.focus();
  };

  const sendAnalytics = () => {
    analytics.trackEvent({
      category: 'search',
      action: 'physical keyboard search',
      value: searchQuery,
    });
  };

  useEffect(() => {
    if (shortcuts.focusInput) {
      focusInputbox();
      dispatch(
        setShortcuts({
          ...shortcuts,
          focusInput: false,
        }),
      );
    }
  }, [shortcuts]);

  useEffect(() => {
    const searchTypeInt = parseInt(searchQuery, 10);
    const isAng = !!searchTypeInt;
    if (databaseProgress >= 1 && searchQuery) {
      if (isAng) {
        loadAng(searchTypeInt).then((rows) => dispatch(setSearchData(rows)));
      } else {
        searchShabads(searchQuery, currentSearchType, currentSource).then((rows) =>
          searchQuery ? dispatch(setSearchData(rows)) : dispatch(setSearchData([])),
        );
      }
    }
  }, [searchQuery, currentSearchType, currentSource]);

  return (
    <>
      <input
        className={`input-box ${className}`}
        type="search"
        ref={inputContextRef}
        placeholder={placeholder}
        value={query}
        onBlur={sendAnalytics}
        onChange={handleChange}
        onKeyDown={handleSpace}
        disabled={disabled}
      />
    </>
  );
};

InputBox.propTypes = {
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  databaseProgress: PropTypes.number,
  query: PropTypes.string,
  setQuery: PropTypes.func,
};

export default InputBox;
