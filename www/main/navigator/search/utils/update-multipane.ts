import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import {
  setPane1,
  setPane2,
  setPane3,
  type PaneState,
} from '../../../common/store/redux/navigatorSlice';
import { i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';

const updateMultipane = () => {
  const { pane1, pane2, pane3 } = useAppSelector((state) => state.navigator);
  const { defaultPaneId } = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();

  const paneMap: Record<number, { setPane: ActionCreatorWithPayload<PaneState>; pane: PaneState }> =
    {
      1: { setPane: setPane1, pane: pane1 },
      2: { setPane: setPane2, pane: pane2 },
      3: { setPane: setPane3, pane: pane3 },
    };

  return (
    baniType: string,
    shabadId: number,
    verseId?: number | null,
    multiPaneId: number | false | null = null,
  ) => {
    let shabadPane: number;
    if (!multiPaneId) {
      const existingPane =
        [pane1, pane2, pane3].findIndex((pane) => pane.activeShabad === shabadId) + 1;
      if (existingPane > 0) {
        shabadPane = existingPane;
      } else {
        shabadPane = defaultPaneId;
      }
    } else {
      shabadPane = multiPaneId;
    }
    const { pane, setPane } = paneMap[shabadPane];
    let newAttributes: PaneState;

    if (verseId) {
      newAttributes = {
        ...pane,
        content: i18n.t('MULTI_PANE.SHABAD'),
        activeShabad: shabadId,
        baniType,
        versesRead: [verseId],
        activeVerse: verseId,
      };
    } else {
      newAttributes = {
        ...pane,
        content: i18n.t('MULTI_PANE.SHABAD'),
        activeShabad: shabadId,
        baniType,
        // A new shabad/bani/ceremony arriving with no target verse (e.g. a fresh
        // bani pick from the controller sends only the id): clear the previous
        // item's active verse so it opens at the start instead of carrying over
        // a stale highlight from the last bani. Same item + no verse leaves it.
        ...(pane.activeShabad !== shabadId ? { activeVerse: '' as const, versesRead: [] } : {}),
      };
    }
    if (pane !== newAttributes) {
      dispatch(setPane(newAttributes));
    }
  };
};

export default updateMultipane;
