import { handleRequestControl } from '../utils';
import { changeFontSize } from '../../../quick-tools-utils';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

// Verbose desktop-side controller tracing. Tagged [CTRL-DESK] + ms timestamp so
// the desktop DevTools console shows every inbound sync message, how it routed,
// and what it applied — pairs with sttm-web's [CTRL-WEB] logs.
const _ts = () => new Date().toISOString().slice(11, 23);
/* eslint-disable no-console */
const dlog = (...a) => console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', _ts(), ...a);
const dwarn = (...a) => console.warn('%c[CTRL-DESK]', 'color:#e80;font-weight:bold', _ts(), ...a);
const derr = (...a) => console.error('%c[CTRL-DESK]', 'color:#e33;font-weight:bold', _ts(), ...a);
/* eslint-enable no-console */

const useSocketListeners = (
  socketData,
  changeActiveShabad,
  adminPin,
  activeShabad,
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
) => {
  if (socketData) {
    const isPinCorrect = parseInt(socketData.pin, 10) === adminPin;
    dlog('RECV ←', { type: socketData.type, host: socketData.host, id: socketData.id, highlight: socketData.highlight, verseId: socketData.verseId, pinOk: isPinCorrect });
    const listenerActions = {
      shabad: (payload) => {
        const shabadId = parseInt(payload.shabadId, 10);
        const verseId = parseInt(payload.verseId, 10);
        const lineCount = parseInt(payload.lineCount, 10);
        dlog('  → shabad: shabadId', shabadId, 'verseId', verseId, 'lineCount', lineCount);

        // A web controller can send a partial payload (e.g. an undefined
        // shabadId that parses to NaN). Don't push NaN into navigator state /
        // the banidb query — bail instead of loading a bogus shabad.
        if (Number.isNaN(shabadId)) {
          dwarn('  → shabad: shabadId is NaN — bailing (bad payload)', payload.shabadId);
          return;
        }

        changeActiveShabad(shabadId, verseId);
        dlog('  → shabad: applied changeActiveShabad(', shabadId, ',', verseId, ')');
        if (!Number.isNaN(lineCount) && lineNumber !== lineCount) setLineNumber(lineCount);
        analytics.trackEvent({
          category: 'controller',
          action: 'shabad',
          label: 'shabadId',
          value: shabadId,
        });
      },
      text: (payload) => {
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
      bani: (payload) => {
        const baniId = parseInt(payload.baniId, 10);
        const verseId = parseInt(payload.verseId, 10);
        dlog('  → bani: baniId', baniId, 'verseId', verseId, '(activeVerseId', activeVerseId, 'savedCPID', savedCrossPlatformId, ')');
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
          dlog('  → bani: new bani, no verse — clearing stale savedCPID', savedCrossPlatformId);
          setSavedCrossPlatformId(null);
        }
        updatePane('bani', baniId);
        analytics.trackEvent({
          category: 'controller',
          action: 'bani',
          label: 'baniId',
          value: baniId,
        });
      },
      ceremony: (payload) => {
        const ceremonyPayload = parseInt(payload.ceremonyId, 10);
        const verseId = parseInt(payload.verseId, 10);
        const lineCount = parseInt(payload.lineCount, 10);
        dlog('  → ceremony: ceremonyId', ceremonyPayload, 'verseId', verseId, 'lineCount', lineCount, '(rawVerseId', payload.verseId, 'activeVerseId', activeVerseId, 'savedCPID', savedCrossPlatformId, ')');
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

        // Apply a verse change within the ceremony. The web controller sends the
        // BaniDB verseId; ShabadText matches it against its verse list (see the
        // savedCrossPlatformId effect). Mirrors the `bani` handler — without this
        // the ceremony verse change was dropped entirely.
        if (verseId && activeVerseId !== verseId) {
          if (savedCrossPlatformId !== verseId) {
            setSavedCrossPlatformId(verseId);
          }
        } else if (isNewCeremony && savedCrossPlatformId != null) {
          // New ceremony, no target verse — drop the previous item's verse so
          // its stale highlight isn't re-applied to the new ceremony.
          dlog('  → ceremony: new ceremony, no verse — clearing stale savedCPID', savedCrossPlatformId);
          setSavedCrossPlatformId(null);
        }
        // Ceremony verses come from the Realm Verse table with Realm-local IDs
        // and no crossPlatformID, so the web's global BaniDB verseId never
        // matches by id. Record the 1-based line position (both lists share the
        // ceremony's Seq order) so ShabadText can resolve the verse by position.
        if (!Number.isNaN(lineCount) && lineNumber !== lineCount) setLineNumber(lineCount);
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
          adminPin,
          fontSizes,
          activeShabad,
          activeShabadId,
          activeVerseId,
          homeVerse,
          ceremonyId,
          sundarGutkaBaniId,
          baniLength,
          // mangalPosition,
        ),
      settings: (payload) => {
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
    // if its an event from web and not from desktop itself
    if (socketData.host !== 'sttm-desktop') {
      const actionType = isPinCorrect ? socketData.type : 'request-control';
      const handler = listenerActions[actionType];
      dlog('routing: type', socketData.type, '→ actionType', actionType, '| handler?', typeof handler === 'function');
      // Guard the boundary: an unknown `type` would otherwise be `undefined(...)`
      // — an instant crash — and a malformed payload must never take the
      // desktop down. Ignore unknown types; log and swallow handler errors.
      if (typeof handler === 'function') {
        try {
          handler(socketData);
        } catch (error) {
          derr(`data handler "${actionType}" threw:`, error);
        }
      } else {
        dwarn('routing: no handler for type', socketData.type, '— ignored');
      }
    } else {
      dlog('ignored own echo (host=sttm-desktop)');
    }
  }
};

export default useSocketListeners;
