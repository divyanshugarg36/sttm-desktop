import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FatehTab, FatehTabList, FatehTabs, SimpleSelect } from '@khalisfoundation/sikhi-ui';
import banidb from '../../../common/constants/banidb';
import {
  setCurrentSearchType,
  setCurrentLanguage,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

function SearchHeader() {
  // For responsiveness
  const [width, setWidth] = useState(window.innerWidth);
  const breakpoint = 1440;
  const resizeFn = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', resizeFn);
    return () => {
      window.removeEventListener('resize', resizeFn);
    };
  }, []);

  const { i18n } = remote.require('./app');
  const gurmukhiSearchText = banidb.GURMUKHI_SEARCH_TEXTS;
  const gurmukhiSearchTypes = Object.keys(gurmukhiSearchText);
  const englishSearchText = banidb.ENGLISH_SEARCH_TEXTS;
  const englishSearchTypes = Object.keys(englishSearchText);

  const { currentLanguage, currentSearchType } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const languages = [
    { value: 'gr', label: 'ਗੁਰਮੁਖੀ' },
    { value: 'en', label: 'English' },
  ];
  const searchText = currentLanguage === 'gr' ? gurmukhiSearchText : englishSearchText;
  const searchTypes = currentLanguage === 'gr' ? gurmukhiSearchTypes : englishSearchTypes;

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

  // `action` keeps the analytics labels of the tabs (search-option) and the
  // narrow-window dropdown (search-type) apart, as before.
  const handleSearchType = (value, action) => {
    if (currentSearchType !== parseInt(value, 10)) {
      dispatch(setCurrentSearchType(parseInt(value, 10)));
    }
    analytics.trackEvent({
      category: 'search',
      action,
      label: value,
    });
  };

  return (
    <>
      <div className="left-pane">
        <FatehTabs
          className="language-selector"
          index={languages.findIndex(({ value }) => value === currentLanguage)}
          onChange={(index) => handleLanguageChange(languages[index].value)}
        >
          <FatehTabList variant="pilled">
            {languages.map(({ value, label, className }) => (
              <FatehTab key={value} className={className}>
                {label}
              </FatehTab>
            ))}
          </FatehTabList>
        </FatehTabs>
      </div>
      {width < breakpoint ? (
        <SimpleSelect
          className="search-select"
          variant="bordered"
          selectSize="sm"
          value={String(currentSearchType)}
          onChange={(event) => handleSearchType(event.target.value, 'search-type')}
          options={searchTypes.map((value) => ({
            value,
            label: i18n.t(`SEARCH.${searchText[value]}`),
          }))}
        />
      ) : (
        <FatehTabs
          className="search-type"
          index={searchTypes.findIndex((value) => parseInt(value, 10) === currentSearchType)}
          onChange={(index) => handleSearchType(searchTypes[index], 'search-option')}
        >
          <FatehTabList variant="pilled">
            {searchTypes.map((value) => (
              <FatehTab key={value}>{i18n.t(`SEARCH.${searchText[value]}`)}</FatehTab>
            ))}
          </FatehTabList>
        </FatehTabs>
      )}
    </>
  );
}

export default SearchHeader;
