import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { FatehTab, FatehTabList, FatehTabs, SimpleSelect } from '@khalisfoundation/sikhi-ui';

import { setCurrentMiscPanel, setHistoryOrder } from '../../../common/store/redux/navigatorSlice';
import { classNames } from '../../../common/utils';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const analytics = remote.getGlobal('analytics');

export const MiscHeader = ({ className }) => {
  const { currentMiscPanel, historyOrder, verseHistory } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const isHistory = currentMiscPanel === 'History';
  const tabs = [
    { panel: 'History', label: 'TOOLBAR.HISTORY' },
    { panel: 'Favorite', label: 'TOOLBAR.FAVORITE' },
    { panel: 'Others', label: 'TOOLBAR.OTHERS' },
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

MiscHeader.propTypes = {
  className: PropTypes.string,
};
