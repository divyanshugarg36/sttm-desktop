import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { setDefaultPaneId } from '../../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const SearchFooter = () => {
  const { searchShabadsCount, pane1, pane2, pane3 } = useSelector((state) => state.navigator);
  const { currentWorkspace, defaultPaneId } = useSelector((state) => state.userSettings);
  const dispatch = useDispatch();

  const addActiveClass = (id) => (id === defaultPaneId ? 'active' : '');

  return (
    <div className="search-footer">
      <span className="search-footer-span1">Sri Guru Granth Sahib</span>
      <span className="search-footer-span2">Sri Dasam Granth</span>
      <span className="search-footer-span3">Amrit Keertan</span>
      <span className="search-footer-span4">Other</span>
      <span>{searchShabadsCount ? `${searchShabadsCount} Results` : ''}</span>
      {currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE') && (
        <div className="default-pane-switcher">
          <PrimaryButton
            className={`pane-1-btn ${addActiveClass(1)}`}
            mode="icon"
            size="xs"
            onClick={() => {
              if (defaultPaneId !== 1) {
                dispatch(setDefaultPaneId(1));
              }
            }}
            disabled={pane1.locked}
          >
            1
          </PrimaryButton>
          <PrimaryButton
            className={`pane-2-btn ${addActiveClass(2)}`}
            mode="icon"
            size="xs"
            onClick={() => {
              if (defaultPaneId !== 2) {
                dispatch(setDefaultPaneId(2));
              }
            }}
            disabled={pane2.locked}
          >
            2
          </PrimaryButton>
          <PrimaryButton
            className={`pane-3-btn ${addActiveClass(3)}`}
            mode="icon"
            size="xs"
            onClick={() => {
              if (defaultPaneId !== 3) {
                dispatch(setDefaultPaneId(3));
              }
            }}
            disabled={pane3.locked}
          >
            3
          </PrimaryButton>
        </div>
      )}
    </div>
  );
};

export default SearchFooter;
