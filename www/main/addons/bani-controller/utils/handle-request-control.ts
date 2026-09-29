import { analytics } from '../../../common/main-app';
import type { NavigatorState } from '../../../common/store/redux/navigatorSlice';
import type { UserSettingsState } from '../../../common/store/redux/userSettingsSlice';
import type { ControllerFontSizes, ControllerId } from '../types';

const handleRequestControl = (
  isPinCorrect: boolean,
  fontSizes: ControllerFontSizes,
  activeShabadId: NavigatorState['activeShabadId'],
  activeVerseId: NavigatorState['activeVerseId'],
  homeVerse: NavigatorState['homeVerse'],
  ceremonyId: NavigatorState['ceremonyId'],
  sundarGutkaBaniId: NavigatorState['sundarGutkaBaniId'],
  baniLength: UserSettingsState['baniLength'],
  // mangalPosition,
) => {
  document.body.classList.toggle(`controller-on`, isPinCorrect);
  window.socket!.emit('data', {
    host: 'sttm-desktop',
    type: 'response-control',
    success: isPinCorrect,
    settings: {
      fontSizes,
    },
  });
  // if Pin is correct and there is a shabad already in desktop, emit that shabad details.
  if (isPinCorrect) {
    const currentShabad: {
      id: ControllerId | null;
      type: 'shabad' | 'ceremony' | 'bani';
      baniLength: string;
    } = {
      id: activeShabadId,
      type: 'shabad',
      baniLength: '',
      // mangalPosition: '',
    };

    if (ceremonyId) {
      currentShabad.id = ceremonyId;
      currentShabad.type = 'ceremony';
    }
    if (sundarGutkaBaniId) {
      currentShabad.id = sundarGutkaBaniId;
      currentShabad.type = 'bani';
      currentShabad.baniLength = baniLength;
      // currentShabad.mangalPosition = mangalPosition;
    }
    let homeId: NavigatorState['homeVerse'] | undefined;
    let highlight: number | '' | null | undefined;

    if (currentShabad.id) {
      if (currentShabad.type === 'shabad') {
        highlight = activeVerseId;
        homeId = homeVerse;
      } else if (currentShabad.type === 'ceremony') {
        highlight = ceremonyId;
      } else if (currentShabad.type === 'bani') {
        highlight = sundarGutkaBaniId;
      }

      window.socket!.emit('data', {
        type: currentShabad.type,
        host: 'sttm-desktop',
        id: currentShabad.id,
        shabadid: currentShabad.id, // @deprecated
        highlight: parseInt(String(highlight), 10),
        homeId: parseInt(String(homeId), 10),
        baniLength: currentShabad.baniLength,
        // mangalPosition: currentShabad.mangalPosition,
      });
    }
  }
  analytics.trackEvent({
    category: 'controller',
    action: 'connection',
    label: 'controller_connection_attempt',
    value: isPinCorrect ? 'Connection Succesfull' : 'Connection Failed',
  });
};

export default handleRequestControl;
