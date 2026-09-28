import React from 'react';
import { SimpleSelect } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../common/utils';
import ShabadHeader from '../shabad/ShabadHeader';
import {
  setMinimizedBySingleDisplay,
  setHistoryOrder,
} from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import type { NavigatorState } from '../../common/store/redux/navigatorSlice';
import type { PaneSlotProps } from '../../common/sttm-ui/pane/Pane';

export const singleDisplayHeader = ({ className }: PaneSlotProps) => {
  const { singleDisplayActiveTab, minimizedBySingleDisplay, historyOrder, verseHistory } =
    useAppSelector((state) => state.navigator);
  const dispatch = useAppDispatch();

  const getActiveTab = (tabName: string) => {
    let component: string | undefined;
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
    <div className={classNames(className, 'single-display__header')}>
      <span>{getActiveTab(singleDisplayActiveTab)}</span>
      {singleDisplayActiveTab === 'history' && verseHistory.length > 1 && (
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
      {singleDisplayActiveTab === 'shabad' && <ShabadHeader />}
      <span onClick={toggleDisplayUI}>
        <Icon name={minimizedBySingleDisplay ? 'maximize' : 'minimize'} />
      </span>
    </div>
  );
};
