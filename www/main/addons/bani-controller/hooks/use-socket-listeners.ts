import { handleRequestControl } from '../utils';
import { changeFontSize } from '../../../quick-tools-utils';
import { analytics } from '../../../common/main-app';
import type { NavigatorState } from '../../../common/store/redux/navigatorSlice';
import type { UserSettingsState } from '../../../common/store/redux/userSettingsSlice';
import {
  isFromDesktop,
  type ControllerBaniMessage,
  type ControllerCeremonyMessage,
  type ControllerFontSizes,
  type ControllerSettingsMessage,
  type ControllerShabadMessage,
  type ControllerSocketData,
  type ControllerTextMessage,
} from '../types';

/** The desktop's state and setters the controller's messages read and change. */
export type SocketListenerContext = {
  changeActiveShabad: (shabadId: number, verseId: number) => void;
  adminPin: number | null;
  activeShabadId: NavigatorState['activeShabadId'];
  activeVerseId: NavigatorState['activeVerseId'];
  homeVerse: NavigatorState['homeVerse'];
  ceremonyId: NavigatorState['ceremonyId'];
  sundarGutkaBaniId: NavigatorState['sundarGutkaBaniId'];
  fontSizes: ControllerFontSizes;
  baniLength: UserSettingsState['baniLength'];
  // mangalPosition,
  isSundarGutkaBani: boolean;
  isCeremonyBani: boolean;
  savedCrossPlatformId: NavigatorState['savedCrossPlatformId'];
  setIsCeremonyBani: (isCeremonyBani: boolean) => void;
  setIsSundarGutkaBani: (isSundarGutkaBani: boolean) => void;
  setSundarGutkaBaniId: (baniId: number) => void;
  setCeremonyId: (ceremonyId: number) => void;
  isMiscSlide: boolean;
  miscSlideText: string;
  isMiscSlideGurmukhi: boolean;
  setIsMiscSlide: (isMiscSlide: boolean) => void;
  setMiscSlideText: (text: string) => void;
  setIsMiscSlideGurmukhi: (isGurmukhi: boolean) => void;
  setSavedCrossPlatformId: (crossPlatformId: number) => void;
  lineNumber: NavigatorState['lineNumber'];
  setLineNumber: (lineNumber: number) => void;
  updatePane: (baniType: string, shabadId: number) => void;
};

// Ids and counts arrive as numbers or strings (or not at all, which parses to NaN).
const toInt = (value: unknown) => parseInt(String(value), 10);

const useSocketListeners = (
  socketData: ControllerSocketData | null,
  {
    changeActiveShabad,
    adminPin,
    activeShabadId,
    activeVerseId,
    homeVerse,
    ceremonyId,
    sundarGutkaBaniId,
    fontSizes,
    baniLength,
    // mangalPosition,
    isSundarGutkaBani,
    isCeremonyBani,
    savedCrossPlatformId,
    setIsCeremonyBani,
    setIsSundarGutkaBani,
    setSundarGutkaBaniId,
    setCeremonyId,
    isMiscSlide,
    miscSlideText,
    isMiscSlideGurmukhi,
    setIsMiscSlide,
    setMiscSlideText,
    setIsMiscSlideGurmukhi,
    setSavedCrossPlatformId,
    lineNumber,
    setLineNumber,
    updatePane,
  }: SocketListenerContext,
) => {
  // if its an event from web and not from desktop itself
  if (socketData && !isFromDesktop(socketData)) {
    const isPinCorrect = toInt(socketData.pin) === adminPin;
    const listenerActions = {
      shabad: (payload: ControllerShabadMessage) => {
        const shabadId = toInt(payload.shabadId);
        const verseId = toInt(payload.verseId);
        const lineCount = toInt(payload.lineCount);

        changeActiveShabad(shabadId, verseId);
        if (lineNumber !== lineCount) setLineNumber(lineCount);
        analytics.trackEvent({
          category: 'controller',
          action: 'shabad',
          label: 'shabadId',
          value: shabadId,
        });
      },
      text: (payload: ControllerTextMessage) => {
        if (!isMiscSlide) {
          setIsMiscSlide(true);
        }
        if (miscSlideText !== payload.text) {
          setMiscSlideText(payload.text);
        }
        if (isMiscSlideGurmukhi !== payload.isGurmukhi) {
          setIsMiscSlideGurmukhi(payload.isGurmukhi);
        }
        analytics.trackEvent({
          category: 'controller',
          action: 'send text',
          label: 'text',
          value: payload.text,
        });
      },
      bani: (payload: ControllerBaniMessage) => {
        const baniId = toInt(payload.baniId);
        const verseId = toInt(payload.verseId);
        if (isCeremonyBani) {
          setIsCeremonyBani(false);
        }

        if (!isSundarGutkaBani) {
          setIsSundarGutkaBani(true);
        }

        if (sundarGutkaBaniId !== baniId) {
          setSundarGutkaBaniId(baniId);
        }

        if (verseId && activeVerseId !== verseId) {
          if (savedCrossPlatformId !== verseId) {
            setSavedCrossPlatformId(verseId);
          }
        }
        updatePane('bani', baniId);
        analytics.trackEvent({
          category: 'controller',
          action: 'bani',
          label: 'baniId',
          value: baniId,
        });
      },
      ceremony: (payload: ControllerCeremonyMessage) => {
        const ceremonyPayload = toInt(payload.ceremonyId);
        if (!isCeremonyBani) {
          setIsCeremonyBani(true);
        }

        if (isSundarGutkaBani) {
          setIsSundarGutkaBani(false);
        }

        if (ceremonyId !== ceremonyPayload) {
          setCeremonyId(ceremonyPayload);
        }
        updatePane('ceremony', ceremonyPayload);
        analytics.trackEvent({
          category: 'controller',
          action: 'ceremony',
          label: 'ceremonyId',
          value: ceremonyPayload,
        });
      },
      'request-control': () =>
        handleRequestControl(
          isPinCorrect,
          fontSizes,
          activeShabadId,
          activeVerseId,
          homeVerse,
          ceremonyId,
          sundarGutkaBaniId,
          baniLength,
          // mangalPosition,
        ),
      settings: (payload: ControllerSettingsMessage) => {
        const { settings } = payload;
        if (settings.action === 'changeFontSize') {
          changeFontSize(settings.target, settings.value === 'plus');
        }
        analytics.trackEvent({
          category: 'controller',
          action: 'settings',
          label: settings.action,
          value: settings.value,
        });
      },
    };
    if (!isPinCorrect) {
      listenerActions['request-control']();
      return;
    }
    // ignore message types the desktop doesn't handle
    switch (socketData.type) {
      case 'shabad':
        listenerActions.shabad(socketData);
        break;
      case 'text':
        listenerActions.text(socketData);
        break;
      case 'bani':
        listenerActions.bani(socketData);
        break;
      case 'ceremony':
        listenerActions.ceremony(socketData);
        break;
      case 'request-control':
        listenerActions['request-control']();
        break;
      case 'settings':
        listenerActions.settings(socketData);
        break;
      default:
        break;
    }
  }
};

export default useSocketListeners;
