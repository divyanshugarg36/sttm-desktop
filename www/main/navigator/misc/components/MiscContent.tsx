import React from 'react';
import { FavoritePane } from './favoritePane';
import { HistoryPane } from './HistoryPane';
import { OtherPane } from './OtherPane';
import { classNames } from '../../../common/utils';
import { useAppSelector } from '../../../common/store/redux/hooks';
import type { PaneSlotProps } from '../../../common/sttm-ui/pane/Pane';

// One root for the panels, as the pane slot (`className` is its pane__content class).
export const MiscContent = ({ className }: PaneSlotProps) => {
  const { currentMiscPanel } = useAppSelector((state) => state.navigator);

  return (
    <div className={className}>
      <HistoryPane className={classNames(currentMiscPanel !== 'History' && 'd-none')} />
      <OtherPane className={classNames(currentMiscPanel !== 'Others' && 'd-none')} />
      <FavoritePane className={currentMiscPanel === 'Favorite' ? '' : 'd-none'} />
    </div>
  );
};
