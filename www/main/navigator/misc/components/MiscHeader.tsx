import React from 'react';
import { FatehTab, FatehTabList, FatehTabs, SimpleSelect } from '@khalisfoundation/sikhi-ui';

import { setCurrentMiscPanel, setHistoryOrder } from '../../../common/store/redux/navigatorSlice';
import { classNames } from '../../../common/utils';
import { analytics, i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { NavigatorState } from '../../../common/store/redux/navigatorSlice';
import type { PaneSlotProps } from '../../../common/sttm-ui/pane/Pane';

export const MiscHeader = ({ className }: PaneSlotProps) => {
  const { currentMiscPanel, historyOrder, verseHistory } = useAppSelector(
    (state) => state.navigator,
  );
  const dispatch = useAppDispatch();

  const isHistory = currentMiscPanel === 'History';
  const tabs = [
    { panel: 'History', label: 'TOOLBAR.HISTORY' },
    { panel: 'Favorite', label: 'TOOLBAR.FAVORITE' },
    { panel: 'Others', label: 'TOOLBAR.OTHERS' },
  ];

  const setTab = (tabName: string) => {
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
    <div className={classNames(className, 'misc-pane__header')}>
      <FatehTabs
        className="misc-pane__tabs"
        index={tabs.findIndex(({ panel }) => panel === currentMiscPanel)}
        onChange={(index) => setTab(tabs[index].panel)}
      >
        <FatehTabList variant="pilled">
          {tabs.map(({ panel, label }) => (
            <FatehTab key={panel} className="misc-pane__tab">
              {i18n.t(label)}
            </FatehTab>
          ))}
        </FatehTabList>
      </FatehTabs>
      <div className="misc-pane__sort">
        {isHistory && verseHistory.length > 1 && (
          <div className="history-sort">
            <div className="history-sort__select">
              <label>Sort by: </label>
              <SimpleSelect
                variant="bordered"
                selectSize="sm"
                value={historyOrder}
                onChange={(e) => {
                  dispatch(setHistoryOrder(e.target.value as NavigatorState['historyOrder']));
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
