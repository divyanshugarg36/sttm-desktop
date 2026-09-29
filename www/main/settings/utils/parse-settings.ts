import settingsJson from '../../../configs/user-settings.json';

/** A setting in configs/user-settings.json. */
export interface SettingConfig {
  title?: string;
  /** A note shown under the setting's name (an i18n key under SETTINGS). */
  notes?: string;
  type?: string;
  initialValue?: number | boolean | string;
  /** Settings shown with this one (a content line's visibility and content). */
  addon?: string[];
  /** The addons' settings, in `addon` order (added by settingsObjGenerator). */
  addonObj?: SettingConfig[];
  /** The settings a reset button resets. */
  resetSettings?: string[];
  /** A setting that disables this one's switch while it's on. */
  disableWhen?: string;
  /** A setting switched off when this one is turned on. */
  disableSetting?: string;
  /** Shown only while the `condition` setting has `conditionValue`. */
  condition?: string;
  conditionValue?: boolean | string;
  /** A dropdown's options: value → label (an i18n key under SETTINGS). */
  options?: Record<string, string>;
  max?: number;
  min?: number;
  step?: number;
  /** A preferences-store key whose value is shown in the setting's note. */
  store?: string;
  dontApplyClass?: boolean;
}

/** A category or subcategory in configs/user-settings.json. */
export interface SettingsCategoryConfig {
  title: string;
  type?: string;
  subcategories?: string[];
  settings?: string[];
  max?: number;
  min?: number;
  step?: number;
}

/** A subcategory with its settings: a group of rows in the Settings overlay. */
export interface SettingsSubcategory extends SettingsCategoryConfig {
  settingObjs: Record<string, SettingConfig>;
}

/** A category with its subcategories: a box in the Settings overlay. */
export interface SettingsCategory extends SettingsCategoryConfig {
  subCatObjs: Record<string, SettingsSubcategory>;
}

const {
  categories,
  settings,
}: {
  categories: Record<string, SettingsCategoryConfig>;
  settings: Record<string, SettingConfig>;
} = settingsJson;

const filterObject = <T extends object>(
  obj: Record<string, T>,
  filter: keyof T,
  filterValue: unknown,
): Record<string, T> =>
  Object.keys(obj).reduce(
    (acc, val) =>
      obj[val][filter] !== filterValue
        ? acc
        : {
            ...acc,
            [val]: obj[val],
          },
    {},
  );

const settingsObjGenerator = () => {
  const settingsNewObj: Record<string, SettingsCategory> = {};
  /* Create a hierarchical structure that would map to the DOM
     It would be like this
     Category 
      |___Subcategory
              |___Setting
                  |_____Addon
  */
  Object.keys(categories).forEach((category) => {
    if (categories[category].type === 'title') {
      settingsNewObj[category] = categories[category] as SettingsCategory;
      settingsNewObj[category].subCatObjs = {};
      categories[category].subcategories!.forEach((subCategory) => {
        settingsNewObj[category].subCatObjs[subCategory] = categories[
          subCategory
        ] as SettingsSubcategory;
        settingsNewObj[category].subCatObjs[subCategory].settingObjs = {};
        settingsNewObj[category].subCatObjs[subCategory].settings!.forEach((setting) => {
          settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting] = settings[setting];
          const { addon } = settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting];
          if (addon && addon.length) {
            settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting].addonObj = [];
            addon.forEach((add) => {
              settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting].addonObj!.push(
                settings[add],
              );
            });
          }
          const subCat = settingsNewObj[category].subCatObjs[subCategory];
          const { type } = subCat;
          if (type === 'range') {
            const { max, min, step } = subCat;
            subCat.settingObjs[setting].max = max;
            subCat.settingObjs[setting].min = min;
            subCat.settingObjs[setting].step = step;
          }
          subCat.settingObjs[setting].type = subCat.settingObjs[setting].type || type;
        });
      });
    }
  });
  return settingsNewObj;
};

export const settingsObj = settingsObjGenerator();

export const settingsNavObj = filterObject(categories, 'type', 'title');
