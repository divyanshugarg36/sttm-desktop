import React from 'react';
import { HistoryPane, OtherPane, FavoritePane } from '../misc/components';
import SearchPane from '../search/components/SearchPane';
import MultiPaneContent from '../shabad/MultiPaneContent';
import { useAppSelector } from '../../common/store/redux/hooks';
import type { PaneSlotProps } from '../../common/sttm-ui/pane/Pane';

export const singleDisplayContent = ({ className }: PaneSlotProps) => {
  const { singleDisplayActiveTab } = useAppSelector((state) => state.navigator);
  const { defaultPaneId } = useAppSelector((state) => state.userSettings);
  const renderSingleTab = (tabName: string) => {
    const components = (
      <div className={className}>
        <SearchPane className={tabName === 'search' ? '' : 'd-none'} />
        <div className={tabName === 'shabad' ? 'pane-wrapper shabad-pane' : 'd-none'}>
          <div className="pane">
            <MultiPaneContent className="pane__content" data={{ multiPaneId: defaultPaneId }} />
          </div>
        </div>
        <HistoryPane className={tabName === 'history' ? '' : 'd-none'} />
        <OtherPane className={tabName === 'other' ? '' : 'd-none'} />
        <FavoritePane className={tabName === 'favorite' ? '' : 'd-none'} />
      </div>
    );

    return components;
  };

  return renderSingleTab(singleDisplayActiveTab);
};
