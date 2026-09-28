import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../../common/utils';
import { setDefaultPaneId } from '../../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const SearchFooter = ({ className }) => {
  const { searchShabadsCount, pane1, pane2, pane3 } = useSelector((state) => state.navigator);
  const { currentWorkspace, defaultPaneId } = useSelector((state) => state.userSettings);
  const dispatch = useDispatch();

  const switchClass = (id) =>
    classNames(
      'search-pane__pane-switch',
      `search-pane__pane-switch--pane-${id}`,
      id === defaultPaneId && 'search-pane__pane-switch--active',
    );

  return (
    <div className={classNames(className, 'search-pane__footer')}>
      <span className="search-pane__source search-pane__source--sggs">Sri Guru Granth Sahib</span>
      <span className="search-pane__source search-pane__source--sdg">Sri Dasam Granth</span>
      <span className="search-pane__source search-pane__source--ak">Amrit Keertan</span>
      <span className="search-pane__source search-pane__source--other">Other</span>
      <span className="search-pane__count">
        {searchShabadsCount ? `${searchShabadsCount} Results` : ''}
      </span>
      {currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE') && (
        <div className="search-pane__pane-switcher">
          <PrimaryButton
            className={switchClass(1)}
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
            className={switchClass(2)}
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
            className={switchClass(3)}
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

SearchFooter.propTypes = {
  className: PropTypes.string,
};

export default SearchFooter;
