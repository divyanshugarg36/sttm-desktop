import React, { useContext, useEffect } from 'react';
import { InputContext } from '../../../launchpad';
import { analytics } from '../../main-app';
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { setShortcuts } from '../../store/redux/navigatorSlice';

type InputBoxProps = {
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  query: string;
  setQuery: (query: string) => void;
  /** Passed by the old search bar; not used. */
  databaseProgress?: number;
};

const InputBox = ({ placeholder, disabled, className, query, setQuery }: InputBoxProps) => {
  const { currentSearchType, searchQuery, shortcuts } = useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();

  // Launchpad provides the search input's ref through InputContext.
  const inputContextRef = useContext(InputContext) as React.RefObject<HTMLInputElement>;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSpace = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 32 && [2, 3].includes(currentSearchType)) {
      setQuery(`${query} `);
    }
  };

  // keyboard shortcut to focus on search input
  const focusInputbox = () => {
    inputContextRef.current!.focus();
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

export default InputBox;
