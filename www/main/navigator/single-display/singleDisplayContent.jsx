import React from 'react';
import { useSelector } from 'react-redux';
import { HistoryPane, OtherPane, FavoritePane } from '../misc/components';
import SearchPane from '../search/components/SearchPane';
import MultiPaneContent from '../shabad/MultiPaneContent';

export const singleDisplayContent = ({ className }) => {
  const { singleDisplayActiveTab } = useSelector((state) => state.navigator);
  const { defaultPaneId } = useSelector((state) => state.userSettings);
  const renderSingleTab = (tabName) => {
    const components = (
      <div className={className}>
        <SearchPane className={tabName === 'search' ? '' : 'd-none'} />
        <div className={tabName === 'shabad' ? 'pane-container shabad-pane' : 'd-none'}>
          <div className="pane">
            <MultiPaneContent className="pane-content" data={{ multiPaneId: defaultPaneId }} />
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
