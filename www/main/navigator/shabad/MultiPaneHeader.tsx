import React, { useEffect, useRef, useState } from 'react';
import { PrimaryButton, SimpleSelect } from '@khalisfoundation/sikhi-ui';
import { classNames } from '../../common/utils';

import FavShabadIcon from './FavShabadIcon';
import ArrowIcon from './ArrowIcon';
import { setDefaultPaneId } from '../../common/store/redux/userSettingsSlice';
import { navigatorActions, type PaneState } from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';
import { i18n } from '../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import type { PaneSlotProps } from '../../common/sttm-ui/pane/Pane';

/** A Multi-Pane pane's key in the navigator state. */
type PaneKey = `pane${1 | 2 | 3}`;

const MultiPaneHeader = ({ data, className }: PaneSlotProps) => {
  const paneId = data.multiPaneId as number;
  const navigatorState = useAppSelector((state) => state.navigator);
  const paneAttributes = navigatorState[`pane${paneId}` as PaneKey];
  const setPaneAttributes = navigatorActions[`setPane${paneId}` as `setPane${1 | 2 | 3}`];

  const { defaultPaneId } = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();

  const [disableLock, setDisableLock] = useState(false);

  const lockIcon = useRef<HTMLButtonElement>(null);

  // No baniType: a cleared pane drops it.
  const defaultPaneAttributes: Omit<PaneState, 'baniType'> = {
    locked: false,
    activeShabad: null,
    activeVerse: '',
    versesRead: [],
    homeVerse: false,
    content: '',
  };

  const nextAvailablePane = (givenPaneId: number) => {
    let nextPane = givenPaneId;
    do {
      if (nextPane === 3) {
        nextPane = 1;
      } else {
        nextPane++;
      }
      if (!navigatorState[`pane${nextPane}` as PaneKey].locked) {
        return nextPane;
      }
    } while (nextPane !== givenPaneId);
    return null;
  };

  const lockPane = () => {
    const updatedAttributes = { ...paneAttributes };
    if (paneAttributes.locked) {
      updatedAttributes.locked = false;
    } else if (!disableLock) {
      updatedAttributes.locked = true;
      if (defaultPaneId === paneId) {
        const newDefault = nextAvailablePane(paneId);
        if (defaultPaneId !== newDefault) {
          dispatch(setDefaultPaneId(newDefault as number));
        }
      }
    }
    if (paneAttributes !== updatedAttributes) {
      dispatch(setPaneAttributes(updatedAttributes));
    }
  };

  useEffect(() => {
    const remainingPanes = [1, 2, 3].filter((pane) => pane !== paneId);
    if (remainingPanes.every((pane) => navigatorState[`pane${pane}` as PaneKey].locked)) {
      lockIcon.current!.classList.add('disabled');
      setDisableLock(true);
    } else {
      lockIcon.current!.classList.remove('disabled');
      setDisableLock(false);
    }
  }, [navigatorState.pane1, navigatorState.pane2, navigatorState.pane3]);

  const selectPaneOption = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setPaneAttributes({ ...paneAttributes, content: event.target.value }));
  };

  return (
    <div
      className={classNames(
        className,
        'shabad-pane__header',
        `shabad-pane__header--pane-${paneId}`,
      )}
    >
      <div className="shabad-pane__info">
        <span className="shabad-pane__number">{paneId}</span>
        <PrimaryButton variant="ghost" mode="icon" size="xs" onClick={lockPane} ref={lockIcon}>
          <Icon name={paneAttributes.locked ? 'lock' : 'lock-open'} />
        </PrimaryButton>
      </div>
      <SimpleSelect
        className="shabad-pane__content-select"
        variant="fateh"
        selectSize="sm"
        value={paneAttributes.content}
        onChange={selectPaneOption}
        options={[
          'MULTI_PANE.SHABAD',
          'TOOLBAR.HISTORY',
          'MULTI_PANE.FAVORITES',
          'MULTI_PANE.MISC_SLIDES',
        ].map((key) => ({ value: i18n.t(key), label: i18n.t(key) }))}
      />
      <div className="shabad-pane__tools">
        <FavShabadIcon paneId={paneId} />
        <ArrowIcon paneId={paneId} />
        {paneAttributes.activeShabad && (
          <PrimaryButton
            variant="ghost"
            size="xs"
            onClick={() => dispatch(setPaneAttributes(defaultPaneAttributes as PaneState))}
          >
            Clear
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
export default MultiPaneHeader;
