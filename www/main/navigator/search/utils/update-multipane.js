import { useSelector, useDispatch } from 'react-redux';
import { setPane1, setPane2, setPane3 } from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const updateMultipane = () => {
  const { pane1, pane2, pane3 } = useSelector((state) => state.navigator);
  const { defaultPaneId } = useSelector((state) => state.userSettings);
  const dispatch = useDispatch();

  const paneMap = {
    1: { setPane: setPane1, pane: pane1 },
    2: { setPane: setPane2, pane: pane2 },
    3: { setPane: setPane3, pane: pane3 },
  };

  return (baniType, shabadId, verseId, multiPaneId = null) => {
    let shabadPane;
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
    let newAttributes;

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
      };
    }
    if (pane !== newAttributes) {
      dispatch(setPane(newAttributes));
    }
  };
};

export default updateMultipane;
