import React from 'react';
import { useSelector } from 'react-redux';
import { FavoritePane } from './favoritePane';
import { HistoryPane } from './HistoryPane';
import { OtherPane } from './OtherPane';
import { classNames } from '../../../common/utils';

export const MiscContent = () => {
  const { currentMiscPanel } = useSelector((state) => state.navigator);

  return (
    <>
      <HistoryPane className={classNames(currentMiscPanel !== 'History' && 'd-none')} />
      <OtherPane className={classNames(currentMiscPanel !== 'Others' && 'd-none')} />
      <FavoritePane className={currentMiscPanel === 'Favorite' ? '' : 'd-none'} />
    </>
  );
};
