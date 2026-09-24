import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FatehTab, FatehTabList, FatehTabs, SimpleSelect } from '@khalisfoundation/sikhi-ui';

import { setCurrentMiscPanel, setHistoryOrder } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const analytics = remote.getGlobal('analytics');

export const MiscHeader = () => {
  const { currentMiscPanel, historyOrder, verseHistory } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const isHistory = currentMiscPanel === 'History';
  const tabs = [
    { panel: 'History', icon: 'clock', label: 'TOOLBAR.HISTORY' },
    { panel: 'Favorite', icon: 'heart', label: 'TOOLBAR.FAVORITE' },
    { panel: 'Others', icon: 'dots', label: 'TOOLBAR.OTHERS' },
  ];

  const setTab = (tabName) => {
    if (tabName !== currentMiscPanel) {
      dispatch(setCurrentMiscPanel(tabName));
    }
    analytics.trackEvent({
      category: 'Misc',
      action: 'set-tab',
      label: tabName,
    });
  };

  return (
    <div className="misc-header">
      <FatehTabs
        className="misc-header-nav"
        index={tabs.findIndex(({ panel }) => panel === currentMiscPanel)}
        onChange={(index) => setTab(tabs[index].panel)}
      >
        <FatehTabList variant="underline">
          {tabs.map(({ panel, icon, label }) => (
            <FatehTab key={panel} className="misc-button">
              <Icon name={icon} />
              <span className="Icon-label">{i18n.t(label)}</span>
            </FatehTab>
          ))}
        </FatehTabList>
      </FatehTabs>
      <div className="misc-header-sort">
        {isHistory && verseHistory.length > 1 && (
          <div className="history-order">
            <div className="history-order-select">
              <label>Sort by: </label>
              <SimpleSelect
                variant="bordered"
                selectSize="sm"
                value={historyOrder}
                onChange={(e) => {
                  dispatch(setHistoryOrder(e.target.value));
                }}
                options={[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
