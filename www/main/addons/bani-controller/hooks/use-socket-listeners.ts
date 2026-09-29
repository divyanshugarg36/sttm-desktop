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
  isAnnouncement: boolean;
  setIsAnnouncement: (isAnnouncement: boolean) => void;
  setSavedCrossPlatformId: (crossPlatformId: number | null) => void;
  lineNumber: NavigatorState['lineNumber'];
  setLineNumber: (lineNumber: number | null) => void;
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
    isAnnouncement,
    setIsAnnouncement,
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

        // A web controller can send a partial payload (e.g. no shabadId, which
        // parses to NaN). Don't push NaN into navigator state / the banidb
        // query — bail instead of loading a bogus shabad.
        if (Number.isNaN(shabadId)) {
          return;
        }

        changeActiveShabad(shabadId, verseId);
        if (!Number.isNaN(lineCount) && lineNumber !== lineCount) setLineNumber(lineCount);
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
        // SlideAnnouncement only honours isMiscSlideGurmukhi when isAnnouncement
        // is set; without it English text renders in the Gurmukhi font.
        if (isAnnouncement !== !!payload.isAnnouncement) {
          setIsAnnouncement(!!payload.isAnnouncement);
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
        const lineCount = toInt(payload.lineCount);
        if (isCeremonyBani) {
          setIsCeremonyBani(false);
        }

        if (!isSundarGutkaBani) {
          setIsSundarGutkaBani(true);
        }

        const isNewBani = sundarGutkaBaniId !== baniId;
        if (isNewBani) {
          setSundarGutkaBaniId(baniId);
        }

        if (verseId && activeVerseId !== verseId) {
          if (savedCrossPlatformId !== verseId) {
            setSavedCrossPlatformId(verseId);
          }
        } else if (isNewBani && savedCrossPlatformId != null) {
          // New bani with no target verse — drop the previous bani's verse so
          // its stale highlight isn't re-applied to the freshly-loaded bani.
          setSavedCrossPlatformId(null);
        }
        // Record the 1-based line position so ShabadText resolves the verse by
        // index (web + desktop share the bani's verse order; verse ids don't
        // share a space across the two, so position is the reliable key). On a
        // fresh bani with no target verse, reset the position so the effect
        // can't re-apply the previous bani's stale index — it opens at the start.
        if (!Number.isNaN(lineCount)) {
          if (lineNumber !== lineCount) setLineNumber(lineCount);
        } else if (isNewBani && lineNumber != null) {
          setLineNumber(null);
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
        const verseId = toInt(payload.verseId);
        const lineCount = toInt(payload.lineCount);
        if (!isCeremonyBani) {
          setIsCeremonyBani(true);
        }

        if (isSundarGutkaBani) {
          setIsSundarGutkaBani(false);
        }

        const isNewCeremony = ceremonyId !== ceremonyPayload;
        if (isNewCeremony) {
          setCeremonyId(ceremonyPayload);
        }

        // Apply a verse change within the ceremony. ShabadText matches the
        // verseId against its verse list (see the savedCrossPlatformId effect).
        // Mirrors the `bani` handler — without this the ceremony verse change
        // was dropped entirely.
        if (verseId && activeVerseId !== verseId) {
          if (savedCrossPlatformId !== verseId) {
            setSavedCrossPlatformId(verseId);
          }
        } else if (isNewCeremony && savedCrossPlatformId != null) {
          // New ceremony, no target verse — drop the previous item's verse so
          // its stale highlight isn't re-applied to the new ceremony.
          setSavedCrossPlatformId(null);
        }
        // The web's verse ids don't match the desktop's ceremony rows, so record
        // the 1-based line position (both lists share the ceremony's order) for
        // ShabadText to resolve the verse by. On a fresh ceremony with no target
        // verse, reset the position so the effect can't re-apply the previous
        // item's stale index.
        if (!Number.isNaN(lineCount)) {
          if (lineNumber !== lineCount) setLineNumber(lineCount);
        } else if (isNewCeremony && lineNumber != null) {
          setLineNumber(null);
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
    // Ignore message types the desktop doesn't handle, and never let a
    // malformed payload take the desktop down.
    try {
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`controller data handler "${socketData.type}" threw:`, error);
    }
  }
};

export default useSocketListeners;
