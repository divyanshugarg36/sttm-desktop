import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { InputContext } from '../../../launchpad';
import { setShortcuts } from '../../store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

const InputBox = ({ placeholder, disabled, className, query, setQuery }) => {
  const { currentSearchType, searchQuery, shortcuts } = useSelector(
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

  // The search itself runs in SearchContent (useRunSearch), whichever input is shown.

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
  query: PropTypes.string,
  setQuery: PropTypes.func,
};

export default InputBox;
