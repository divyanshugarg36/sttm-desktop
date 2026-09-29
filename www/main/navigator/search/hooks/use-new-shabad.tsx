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
import { i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';

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
  } = useAppSelector((state) => state.navigator);

  const { currentWorkspace } = useAppSelector((state) => state.userSettings);

  const dispatch = useAppDispatch();

  const updatePane = updateMultipane();

  return (
    newSelectedShabad: number,
    newSelectedVerse: number,
    newSearchVerse?: string,
    multiPaneId: number | false = false,
  ) => {
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
        dispatch(setSearchVerse(newSearchVerse as string));
      }
    }

    if (newSelectedVerse && activeVerseId !== newSelectedVerse) {
      dispatch(setActiveVerseId(newSelectedVerse));
    }
  };
};
