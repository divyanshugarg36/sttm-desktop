import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { classNames } from '../../common/utils';
import { setSingleDisplayActiveTab } from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';

export const singleDisplayFooter = () => {
  const { singleDisplayActiveTab } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();
  const openSearchPane = () => {
    if (singleDisplayActiveTab !== 'search') {
      dispatch(setSingleDisplayActiveTab('search'));
    }
  };

  const openShabadPane = () => {
    if (singleDisplayActiveTab !== 'shabad') {
      dispatch(setSingleDisplayActiveTab('shabad'));
    }
  };
  const openOtherPane = () => {
    if (singleDisplayActiveTab !== 'other') {
      dispatch(setSingleDisplayActiveTab('other'));
    }
  };
  const openHistoryPane = () => {
    if (singleDisplayActiveTab !== 'history') {
      dispatch(setSingleDisplayActiveTab('history'));
    }
  };
  const openFavoritePane = () => {
    if (singleDisplayActiveTab !== 'favorite') {
      dispatch(setSingleDisplayActiveTab('favorite'));
    }
  };

  return (
    <div className="single-display-switches">
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'search' && 'active')}
        onClick={openSearchPane}
      >
        <Icon name="search" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'history' && 'active')}
        onClick={openHistoryPane}
      >
        <Icon name="clock" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'shabad' && 'active')}
        onClick={openShabadPane}
      >
        <Icon name="target" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'favorite' && 'active')}
        onClick={openFavoritePane}
      >
        <Icon name="heart" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'other' && 'active')}
        onClick={openOtherPane}
      >
        <Icon name="dots" />
      </button>
    </div>
  );
};
