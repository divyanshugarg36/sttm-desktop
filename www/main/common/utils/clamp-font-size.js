// Font sizes are in vh, set from Settings, Quick Tools and the Bani Controller.
export const MIN_FONT_SIZE = 1;
export const MAX_FONT_SIZE = 20;

export const isFontSizeSetting = (settingKey) => settingKey.endsWith('-font-size');

// A whole number from MIN_FONT_SIZE to MAX_FONT_SIZE, or the fallback for a value
// that isn't a number at all.
const clampFontSize = (value, fallback) => {
  const size = parseInt(value, 10);
  if (Number.isNaN(size)) {
    return fallback;
  }
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, size));
};

export default clampFontSize;
