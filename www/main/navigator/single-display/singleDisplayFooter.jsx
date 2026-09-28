import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../common/utils';
import { setSingleDisplayActiveTab } from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';

export const singleDisplayFooter = ({ className }) => {
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
    <div className={classNames(className, 'single-display__switches')}>
      <PrimaryButton
        className={classNames(
          'single-display__switch',
          singleDisplayActiveTab === 'search' && 'single-display__switch--active',
        )}
        variant={singleDisplayActiveTab === 'search' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openSearchPane}
      >
        <Icon name="search" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames(
          'single-display__switch',
          singleDisplayActiveTab === 'history' && 'single-display__switch--active',
        )}
        variant={singleDisplayActiveTab === 'history' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openHistoryPane}
      >
        <Icon name="clock" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames(
          'single-display__switch',
          singleDisplayActiveTab === 'shabad' && 'single-display__switch--active',
        )}
        variant={singleDisplayActiveTab === 'shabad' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openShabadPane}
      >
        <Icon name="target" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames(
          'single-display__switch',
          singleDisplayActiveTab === 'favorite' && 'single-display__switch--active',
        )}
        variant={singleDisplayActiveTab === 'favorite' ? 'default' : 'ghost'}
        mode="icon"
        size="sm"
        onClick={openFavoritePane}
      >
        <Icon name="heart" />
      </PrimaryButton>
      <PrimaryButton
        className={classNames(
          'single-display__switch',
          singleDisplayActiveTab === 'other' && 'single-display__switch--active',
        )}
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
