import React from 'react';
import { useSelector } from 'react-redux';
import { FavoritePane } from './favoritePane';
import { HistoryPane } from './HistoryPane';
import { OtherPane } from './OtherPane';
import { classNames } from '../../../common/utils';

// One root for the panels, as the pane slot (`className` is its pane-content class).
export const MiscContent = ({ className }) => {
  const { currentMiscPanel } = useSelector((state) => state.navigator);

  return (
    <div className={className}>
      <HistoryPane className={classNames(currentMiscPanel !== 'History' && 'd-none')} />
      <OtherPane className={classNames(currentMiscPanel !== 'Others' && 'd-none')} />
      <FavoritePane className={currentMiscPanel === 'Favorite' ? '' : 'd-none'} />
    </div>
  );
};
