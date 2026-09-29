import type { ControllerFontSizes } from '../types';

// The web controller sizes Gurbani and each content type (translation, teeka,
// transliteration), but the desktop sizes Gurbani and three content slots
// (content1-3), each showing whichever type the user picked (e.g.
// 'teeka-punjabi'). These map between the two.

const CONTENT_SLOTS = ['content1', 'content2', 'content3'] as const;
const CONTENT_TYPES = ['translation', 'teeka', 'transliteration'] as const;

// The user settings (camelCase), read by key.
type SlotSettings = object;
const read = (settings: SlotSettings, key: string) => (settings as Record<string, unknown>)[key];

/**
 * The slot showing a content type ('translation' → 'content1'), 'gurbani' as
 * is, or undefined when no slot shows it.
 */
export const getFontSizeSlot = (target: string | undefined, userSettings: SlotSettings) => {
  if (target === 'gurbani') return target;
  return CONTENT_SLOTS.find((slot) => String(read(userSettings, slot)).startsWith(`${target}-`));
};

/** The font sizes the web controller shows; a type no slot shows is null. */
export const getControllerFontSizes = (userSettings: SlotSettings): ControllerFontSizes => {
  const fontSizes: ControllerFontSizes = {
    gurbani: parseInt(String(read(userSettings, 'gurbaniFontSize')), 10),
  };
  CONTENT_TYPES.forEach((type) => {
    const slot = getFontSizeSlot(type, userSettings);
    fontSizes[type] = slot ? parseInt(String(read(userSettings, `${slot}FontSize`)), 10) : null;
  });
  return fontSizes;
};
