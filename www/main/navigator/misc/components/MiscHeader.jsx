import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { classNames } from '../../../common/utils';
import { setCurrentMiscPanel, setHistoryOrder } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const analytics = remote.getGlobal('analytics');

export const MiscHeader = () => {
  const { currentMiscPanel, historyOrder, verseHistory } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const isHistory = currentMiscPanel === 'History';
  const isOther = currentMiscPanel === 'Others';
  const isFav = currentMiscPanel === 'Favorite';

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
      <div className="misc-header-nav">
        <a
          className={classNames('misc-button', isHistory && 'misc-active')}
          onClick={() => setTab('History')}
        >
          <Icon name="clock">
            <span className="Icon-label" key="History">
              {i18n.t('TOOLBAR.HISTORY')}
            </span>
          </Icon>
        </a>
        <a
          className={classNames('misc-button', isFav && 'misc-active')}
          onClick={() => setTab('Favorite')}
        >
          <Icon name="heart">
            <span className="Icon-label" key="Favorite">
              {i18n.t('TOOLBAR.FAVORITE')}
            </span>
          </Icon>
        </a>
        <a
          className={classNames('misc-button', isOther && 'misc-active')}
          onClick={() => setTab('Others')}
        >
          <Icon name="dots">
            <span className="Icon-label" key="Others">
              {i18n.t('TOOLBAR.OTHERS')}
            </span>
          </Icon>
        </a>
      </div>
      <div className="misc-header-sort">
        {isHistory && verseHistory.length > 1 && (
          <div className="history-order">
            <div className="history-order-select">
              <label>Sort by: </label>
              <select
                value={historyOrder}
                onChange={(e) => {
                  dispatch(setHistoryOrder(e.target.value));
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
