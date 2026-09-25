import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
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
      <PrimaryButton
        className={classNames('tab-switch', singleDisplayActiveTab === 'search' && 'active')}
        variant={singleDisplayActiveTab === 'search' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openSearchPane}
      >
        <Icon name="search" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames('tab-switch', singleDisplayActiveTab === 'history' && 'active')}
        variant={singleDisplayActiveTab === 'history' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openHistoryPane}
      >
        <Icon name="clock" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames('tab-switch', singleDisplayActiveTab === 'shabad' && 'active')}
        variant={singleDisplayActiveTab === 'shabad' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openShabadPane}
      >
        <Icon name="target" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames('tab-switch', singleDisplayActiveTab === 'favorite' && 'active')}
        variant={singleDisplayActiveTab === 'favorite' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openFavoritePane}
      >
        <Icon name="heart" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames('tab-switch', singleDisplayActiveTab === 'other' && 'active')}
        variant={singleDisplayActiveTab === 'other' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openOtherPane}
      >
        <Icon name="dots" />
      </PrimaryButton>
    </div>
  );
};
