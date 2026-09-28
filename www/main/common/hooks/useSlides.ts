import insertSlide from '../constants/slidedb';
import { analytics, i18n } from '../main-app';
import { useAppDispatch, useAppSelector } from '../store/redux/hooks';
import { setAkhandpatt, setAutoplayToggle } from '../store/redux/userSettingsSlice';
import {
  setIsMiscSlide,
  setMiscSlideText,
  setIsAnnouncement,
  setIsSundarGutkaBani,
  setIsCeremonyBani,
  setCeremonyId,
  setPane1,
  setPane2,
  setPane3,
} from '../store/redux/navigatorSlice';

/** Where a slide was opened from, for analytics. */
interface OpenedFrom {
  openedFrom: string;
}

export const useSlides = () => {
  const { akhandpatt, autoplayToggle, defaultPaneId } = useAppSelector(
    (state) => state.userSettings,
  );
  const dispatch = useAppDispatch();
  const {
    isMiscSlide,
    miscSlideText,
    isAnnouncement,
    isSundarGutkaBani,
    isCeremonyBani,
    ceremonyId,
    pane1,
    pane2,
    pane3,
  } = useAppSelector((state) => state.navigator);

  const addMiscSlide = (givenText: string) => {
    if (isAnnouncement) {
      dispatch(setIsAnnouncement(false));
    }
    if (!isMiscSlide) {
      if (akhandpatt) {
        dispatch(setAkhandpatt(false));
      }
      if (autoplayToggle) {
        dispatch(setAutoplayToggle(false));
      }
      dispatch(setIsMiscSlide(true));
    }
    if (miscSlideText !== givenText) {
      dispatch(setMiscSlideText(givenText));
    }
  };

  const displayWaheguruSlide = ({ openedFrom }: OpenedFrom) => {
    addMiscSlide(insertSlide.slideStrings.waheguru);
    analytics.trackEvent({
      category: 'display',
      action: 'waheguru-slide',
      label: `Opened from: ${openedFrom}`,
    });
  };

  const displayMoolMantraSlide = ({ openedFrom }: OpenedFrom) => {
    addMiscSlide(insertSlide.slideStrings.moolMantra);
    analytics.trackEvent({
      category: 'display',
      action: 'moool-mantra-slide',
      label: `Opened from: ${openedFrom}`,
    });
  };

  const displayBlankViewer = ({ openedFrom }: OpenedFrom) => {
    addMiscSlide('');
    analytics.trackEvent({
      category: 'display',
      action: 'empty-slide',
      label: `Opened from: ${openedFrom}`,
    });
  };

  const displayAnandSahibBhog = ({
    openedFrom,
    paneId = null,
  }: OpenedFrom & { paneId?: number | null }) => {
    if (isSundarGutkaBani) {
      dispatch(setIsSundarGutkaBani(false));
    }
    if (ceremonyId !== 3) {
      dispatch(setCeremonyId(3));
    }
    if (!isCeremonyBani) {
      dispatch(setIsCeremonyBani(true));
    }
    const currentPane = paneId || defaultPaneId;
    switch (currentPane) {
      case 1:
        dispatch(
          setPane1({
            ...pane1,
            content: i18n.t('MULTI_PANE.SHABAD'),
            baniType: 'ceremony',
            activeShabad: 3,
          }),
        );
        break;
      case 2:
        dispatch(
          setPane2({
            ...pane2,
            content: i18n.t('MULTI_PANE.SHABAD'),
            baniType: 'ceremony',
            activeShabad: 3,
          }),
        );
        break;
      case 3:
        dispatch(
          setPane3({
            ...pane3,
            content: i18n.t('MULTI_PANE.SHABAD'),
            baniType: 'ceremony',
            activeShabad: 3,
          }),
        );
        break;
      default:
        break;
    }
    analytics.trackEvent({
      category: 'ceremony',
      action: 'anand-sahib-bhog',
      label: `Opened from: ${openedFrom}`,
    });
  };

  return {
    displayWaheguruSlide,
    displayMoolMantraSlide,
    displayBlankViewer,
    displayAnandSahibBhog,
  };
};
