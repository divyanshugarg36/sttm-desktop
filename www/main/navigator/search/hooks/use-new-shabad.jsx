import { useSelector, useDispatch } from 'react-redux';
import updateMultipane from '../utils/update-multipane';
import {
  setActiveShabadId,
  setInitialVerseId,
  setVersesRead,
  setActiveVerseId,
  setIsMiscSlide,
  setIsSundarGutkaBani,
  setIsCeremonyBani,
  setSingleDisplayActiveTab,
  setSearchVerse,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

export const useNewShabad = () => {
  const {
    versesRead,
    activeShabadId,
    initialVerseId,
    activeVerseId,
    isSundarGutkaBani,
    isCeremonyBani,
    isMiscSlide,
    singleDisplayActiveTab,
    searchVerse,
  } = useSelector((state) => state.navigator);

  const { currentWorkspace } = useSelector((state) => state.userSettings);

  const dispatch = useDispatch();

  const updatePane = updateMultipane();

  return (newSelectedShabad, newSelectedVerse, newSearchVerse, multiPaneId = false) => {
    updatePane('shabad', newSelectedShabad, newSelectedVerse, multiPaneId);

    if (singleDisplayActiveTab !== 'shabad') {
      dispatch(setSingleDisplayActiveTab('shabad'));
    }

    if (!versesRead.includes(newSelectedVerse)) {
      dispatch(setVersesRead([newSelectedVerse]));
    }
    if (isMiscSlide) {
      dispatch(setIsMiscSlide(false));
    }
    if (isSundarGutkaBani) {
      dispatch(setIsSundarGutkaBani(false));
    }
    if (isCeremonyBani) {
      dispatch(setIsCeremonyBani(false));
    }

    if (activeShabadId !== newSelectedShabad) {
      if (currentWorkspace !== i18n.t('WORKSPACES.MULTI_PANE')) {
        dispatch(setActiveShabadId(newSelectedShabad));
        if (window.socket !== undefined && window.socket !== null) {
          window.socket.emit('data', {
            type: 'shabad',
            host: 'sttm-desktop',
            id: newSelectedShabad,
            shabadid: newSelectedShabad, // @deprecated
            highlight: newSelectedVerse,
            homeId: newSelectedVerse,
            verseChange: false,
          });
        }
      }

      // initialVerseId is the verse which is stored in history
      // It is the verse we searched for.
      if (initialVerseId !== newSelectedVerse) {
        dispatch(setInitialVerseId(newSelectedVerse));
      }

      if (searchVerse !== newSearchVerse) {
        dispatch(setSearchVerse(newSearchVerse));
      }
    }

    if (newSelectedVerse && activeVerseId !== newSelectedVerse) {
      dispatch(setActiveVerseId(newSelectedVerse));
    }
  };
};
