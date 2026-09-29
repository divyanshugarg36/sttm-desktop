import settingsConfig from '../configs/settings.json';
import { store } from './common/main-app';
import type { ControllerFontSizes } from './addons/bani-controller/types';

/**
 * A setting in www/configs/settings.json. What `options` holds depends on the
 * type: flags (checkbox / switch / radio), dropdowns with their own options,
 * or ranges.
 */
interface SettingDefinition {
  type: string;
  options: Record<string, { min: number; max: number; step: number; options: object }>;
}

const settings = settingsConfig as unknown as Record<
  string,
  { settings: Record<string, SettingDefinition> }
>;

/** The saved preferences, by category and setting (userPrefs in the preferences store). */
type UserPrefs = Record<string, Record<string, Record<string, unknown>>>;

const settingsPage = {
  init() {
    this.applySettings();
  },

  applySettings(prefs: UserPrefs | false = false) {
    const newUserPrefs = prefs || (store.getAllPrefs() as UserPrefs);
    if (window.socket !== undefined && window.socket !== null) {
      window.socket.emit('data', {
        host: 'sttm-desktop',
        type: 'settings',
        settings: {
          fontSizes: store.getUserPref('slide-layout.font-sizes') as ControllerFontSizes,
        },
      });
    }
    Object.keys(settings).forEach((catKey) => {
      const cat = settings[catKey];
      Object.keys(cat.settings).forEach((settingKey) => {
        const setting = cat.settings[settingKey];
        switch (setting.type) {
          case 'checkbox':
          case 'switch':
            Object.keys(setting.options).forEach((option) => {
              if (newUserPrefs[catKey][settingKey][option]) {
                document.body.classList.add(option);
              } else {
                document.body.classList.remove(option);
              }
            });
            break;
          case 'radio':
            Object.keys(setting.options).forEach((optionToRemove) => {
              document.body.classList.remove(optionToRemove);
            });
            // A radio's value is the option's key (classList stringifies it).
            document.body.classList.add(String(newUserPrefs[catKey][settingKey]));
            break;

          case 'dropdown':
            Object.keys(setting.options).forEach((dropdown) => {
              Object.keys(setting.options[dropdown].options).forEach((option) => {
                document.body.classList.remove(`${settingKey}-${dropdown}-${option}`);
                if (newUserPrefs[catKey][settingKey][dropdown] === option) {
                  document.body.classList.add(`${settingKey}-${dropdown}-${option}`);
                }
              });
            });
            break;

          case 'range':
            Object.keys(setting.options).forEach((optionKey) => {
              const option = setting.options[optionKey];
              for (let i = option.min; i <= option.max; i += option.step) {
                document.body.classList.remove(`${optionKey}-${i}`);
              }
              document.body.classList.add(
                `${optionKey}-${newUserPrefs[catKey][settingKey][optionKey]}`,
              );
            });
            break;

          default:
            break;
        }
      });
    });
  },
};

export default settingsPage;
