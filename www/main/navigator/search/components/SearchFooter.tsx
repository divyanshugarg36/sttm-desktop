import React from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../../common/utils';
import { setDefaultPaneId } from '../../../common/store/redux/userSettingsSlice';
import { i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { PaneSlotProps } from '../../../common/sttm-ui/pane/Pane';

const SearchFooter = ({ className }: PaneSlotProps) => {
  const { searchShabadsCount, pane1, pane2, pane3 } = useAppSelector((state) => state.navigator);
  const { currentWorkspace, defaultPaneId } = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();

  const switchClass = (id: number) =>
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

export default SearchFooter;
