import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { classNames } from '../../common/utils';
import { setSingleDisplayActiveTab } from '../../common/store/redux/navigatorSlice';

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
        <i className="fa fa-search" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'history' && 'active')}
        onClick={openHistoryPane}
      >
        <i className="fa fa-history" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'shabad' && 'active')}
        onClick={openShabadPane}
      >
        <i className="fa fa-dot-circle-o" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'favorite' && 'active')}
        onClick={openFavoritePane}
      >
        <i className="fa fa-heart" />
      </button>
      <button
        className={classNames('tab-switch', singleDisplayActiveTab === 'other' && 'active')}
        onClick={openOtherPane}
      >
        <i className="fa fa-ellipsis-h" />
      </button>
    </div>
  );
};
