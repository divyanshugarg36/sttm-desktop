import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { SimpleSelect } from '@khalisfoundation/sikhi-ui';
import ShabadHeader from '../shabad/ShabadHeader';
import {
  setMinimizedBySingleDisplay,
  setHistoryOrder,
} from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';

export const singleDisplayHeader = () => {
  const { singleDisplayActiveTab, minimizedBySingleDisplay, historyOrder, verseHistory } =
    useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const getActiveTab = (tabName) => {
    let component;
    switch (tabName) {
      case 'search':
        component = 'Search';
        break;

      case 'shabad':
        component = '';

        break;

      case 'history':
        component = 'History';
        break;

      case 'other':
        component = 'Other';

        break;

      case 'announcement':
        component = 'Announcement';
        break;

      case 'dhan-guru':
        component = 'Dhan Guru';
        break;

      case 'favorite':
        component = 'Favorites';
        break;

      default:
        break;
    }
    return component;
  };

  const toggleDisplayUI = () => {
    if (minimizedBySingleDisplay) {
      dispatch(setMinimizedBySingleDisplay(false));
    } else {
      dispatch(setMinimizedBySingleDisplay(true));
    }
  };

  return (
    <div className="header-controller">
      <span>{getActiveTab(singleDisplayActiveTab)}</span>
      {singleDisplayActiveTab === 'history' && verseHistory.length > 1 && (
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
      {singleDisplayActiveTab === 'shabad' && <ShabadHeader />}
      <span onClick={toggleDisplayUI}>
        <Icon name={minimizedBySingleDisplay ? 'maximize' : 'minimize'} />
      </span>
    </div>
  );
};
