/** Saved settings: setting key (kebab-case) → value. */
export type SavedSettings = Record<string, unknown>;

export const applyUserSettings = (savedSettings: SavedSettings) => {
  if (typeof localStorage === 'object') {
    localStorage.setItem('userSettings', JSON.stringify(savedSettings));
  }
  if (document) {
    Object.keys(savedSettings).forEach((key) => {
      if (typeof savedSettings[key] !== 'object') {
        document.body.classList.add(`${key}-${savedSettings[key]}`);
      }
    });
  }
};
