// The messages the desktop and a bani controller (sttm.co/control, or a
// local app posting to /api/bani-control) exchange as socket.io 'data'
// events. Each carries a `type`, and `host` says who sent it.

/** A shabad / bani / ceremony id as the desktop sends it (activeShabadId can be a string). */
export type ControllerId = number | string;

/** The font sizes the controller shows and adjusts, per content kind. */
export interface ControllerFontSizes {
  gurbani?: number;
  translation?: number;
  teeka?: number;
  transliteration?: number;
}

/* ---------- Desktop → controller ---------- */

interface DesktopMessageBase {
  host: 'sttm-desktop';
}

/** The reply to a controller's request-control: whether its PIN was right. */
export interface ResponseControlMessage extends DesktopMessageBase {
  type: 'response-control';
  success: boolean;
  settings: { fontSizes: ControllerFontSizes };
}

/** What the desktop is showing, so the controller can follow along. */
interface DesktopContentMessageBase extends DesktopMessageBase {
  /** The shabad, bani or ceremony id. */
  id: ControllerId | null;
  /** @deprecated the same as `id`, for older controllers. */
  shabadid: ControllerId | null;
  /**
   * The line to highlight: a shabad's verseId, a bani / ceremony line's
   * crossPlatformId. NaN when the desktop has none (request-control's reply).
   */
  highlight: number;
  /** A shabad's home verse (NaN or false when there is none). */
  homeId?: number | false;
  /** The bani length setting ('' for a shabad or ceremony). */
  baniLength?: string;
  verseChange?: boolean;
}

export interface DesktopShabadMessage extends DesktopContentMessageBase {
  type: 'shabad';
}

export interface DesktopBaniMessage extends DesktopContentMessageBase {
  type: 'bani';
}

export interface DesktopCeremonyMessage extends DesktopContentMessageBase {
  type: 'ceremony';
}

/** The desktop's font sizes changed. */
export interface DesktopSettingsMessage extends DesktopMessageBase {
  type: 'settings';
  settings: { fontSizes: ControllerFontSizes };
}

/** A message the desktop emits on the controller socket. */
export type DesktopMessage =
  | ResponseControlMessage
  | DesktopShabadMessage
  | DesktopBaniMessage
  | DesktopCeremonyMessage
  | DesktopSettingsMessage;

/* ---------- Controller → desktop ---------- */

// These arrive unvalidated: ids and PINs can be numbers or strings (the
// handlers parseInt them), and a field the desktop reads may be missing (an
// id then parses to NaN).

interface ControllerMessageBase {
  /** 'sttm-web' from the web controller, 'local-ipc' from /api/bani-control. */
  host?: string;
  /** The PIN the operator typed; compared with the desktop's adminPin. */
  pin?: number | string;
}

/** A controller asking to connect (also how a wrong PIN is answered). */
export interface RequestControlMessage extends ControllerMessageBase {
  type: 'request-control';
}

/** Open a shabad (at a verse). */
export interface ControllerShabadMessage extends ControllerMessageBase {
  type: 'shabad';
  shabadId: number | string;
  /** A BaniDB verseId, the same ID space as the desktop's activeVerseId. */
  verseId?: number | string;
  /** The verse's 1-based position in the shabad. */
  lineCount?: number | string;
}

/** Open a Sundar Gutka bani (at a line). */
export interface ControllerBaniMessage extends ControllerMessageBase {
  type: 'bani';
  baniId: number | string;
  /** Kept as the bani's savedCrossPlatformId. */
  verseId?: number | string;
  lineCount?: number | string;
}

/** Open a ceremony. */
export interface ControllerCeremonyMessage extends ControllerMessageBase {
  type: 'ceremony';
  ceremonyId: number | string;
  verseId?: number | string;
  lineCount?: number | string;
}

/** Show a text slide (an announcement). */
export interface ControllerTextMessage extends ControllerMessageBase {
  type: 'text';
  text: string;
  isGurmukhi: boolean;
  isAnnouncement?: boolean;
}

/** Change a setting; the desktop acts on `changeFontSize`. */
export interface ControllerSettingsMessage extends ControllerMessageBase {
  type: 'settings';
  settings: {
    action?: string;
    /** The font size to change: gurbani, translation, … */
    target?: string;
    /** 'plus' to increase, anything else to decrease. */
    value?: unknown;
  };
}

/** A message a controller sends the desktop. */
export type ControllerMessage =
  | RequestControlMessage
  | ControllerShabadMessage
  | ControllerBaniMessage
  | ControllerCeremonyMessage
  | ControllerTextMessage
  | ControllerSettingsMessage;

/** Anything on the socket's 'data' events: a controller's messages, or the desktop's own. */
export type ControllerSocketData = ControllerMessage | DesktopMessage;

/** Whether a message is one the desktop sent (so not a controller command). */
export const isFromDesktop = (data: ControllerSocketData): data is DesktopMessage =>
  data.host === 'sttm-desktop';
