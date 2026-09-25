import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FatehTab, FatehTabList, FatehTabs } from '@khalisfoundation/sikhi-ui';
import {
  setCurrentSearchType,
  setCurrentLanguage,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

// The search language. The search type is picked in the search bar
// (LibrarySearchBar), which switches the language to match.
function SearchHeader() {
  const { currentLanguage, currentSearchType } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const languages = [
    { value: 'gr', label: 'ਗੁਰਮੁਖੀ' },
    { value: 'en', label: 'English' },
  ];

  const handleLanguageChange = (language) => {
    if (language === 'en' && currentSearchType !== 3) {
      dispatch(setCurrentSearchType(3));
    }
    if (language !== 'en' && currentSearchType !== 0) {
      dispatch(setCurrentSearchType(0));
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

  return (
    <div className="left-pane">
      <FatehTabs
        className="language-selector"
        index={languages.findIndex(({ value }) => value === currentLanguage)}
        onChange={(index) => handleLanguageChange(languages[index].value)}
      >
        <FatehTabList variant="pilled">
          {languages.map(({ value, label }) => (
            <FatehTab key={value}>{label}</FatehTab>
          ))}
        </FatehTabList>
      </FatehTabs>
    </div>
  );
}

export default SearchHeader;
