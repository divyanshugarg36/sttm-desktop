const firstCharToUpperCase = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

// A slide line's settings prefix: `gurbani` as is; translation / teeka /
// transliteration live on whichever content line (content1..3) shows them, or
// null when none does.
const settingPrefix = (iconType: string | undefined) => {
  if (!iconType || !['translation', 'teeka', 'transliteration'].includes(iconType)) {
    return iconType;
  }
  const line = [1, 2, 3].find((n) =>
    String(global.getUserSettings[`content${n}`]).startsWith(iconType),
  );
  return line ? `content${line}` : null;
};

export const changeFontSize = (iconType: string | undefined, increase = true) => {
  const prefix = settingPrefix(iconType);
  if (!prefix) return;
  const setterAction = `set${firstCharToUpperCase(prefix)}FontSize`;
  const getterVar = `${prefix}FontSize`;
  const oldValue = parseInt(global.getUserSettings[getterVar] as string, 10);
  const newValue = increase ? oldValue + 1 : oldValue - 1;
  try {
    global.setUserSettings[setterAction](newValue);
  } catch (error) {
    console.error('Error changing font size:', error);
  }
};

export const changeVisibility = (iconType: string) => {
  const prefix = settingPrefix(iconType);
  if (!prefix) return;
  const setterAction = `set${firstCharToUpperCase(prefix)}Visibility`;
  const getterVar = `${prefix}Visibility`;
  const oldValue = global.getUserSettings[getterVar];
  try {
    global.setUserSettings[setterAction](!oldValue);
  } catch (error) {
    console.error('Error changing visibility:', error);
  }
};
