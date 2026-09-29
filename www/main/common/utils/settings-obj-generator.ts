/** A category or subcategory in a settings config (e.g. overlay.json's sidebar). */
interface SettingsCategoryConfig {
  title?: string;
  type?: string;
  toggle?: boolean;
  subcategories?: string[];
  settings?: string[];
  max?: number;
  min?: number;
  step?: number;
}

/** A single setting in a settings config. */
interface SettingConfig {
  type?: string;
  addon?: string[];
  max?: number;
  min?: number;
  step?: number;
  [field: string]: unknown;
}

interface SettingsConfig {
  categories: Record<string, SettingsCategoryConfig>;
  settings: Record<string, SettingConfig>;
}

/** A setting, with its addon's setting when it has one. */
export interface GeneratedSetting extends SettingConfig {
  addonObj?: SettingConfig;
}

export interface GeneratedSubcategory extends SettingsCategoryConfig {
  settingObjs: Record<string, GeneratedSetting>;
}

export interface GeneratedCategory extends SettingsCategoryConfig {
  subCatObjs: Record<string, GeneratedSubcategory>;
}

export const settingsObjGenerator = (obj: SettingsConfig) => {
  const { categories, settings } = obj;

  const settingsNewObj: Record<string, GeneratedCategory> = {};
  /* Create a hierarchical structure that would map to the DOM
       It would be like this
       Category 
        |___Subcategory
                |___Setting
                    |_____Addon
    */
  Object.keys(categories).forEach((category) => {
    if (categories[category].type === 'title') {
      settingsNewObj[category] = categories[category] as GeneratedCategory;
      settingsNewObj[category].subCatObjs = {};
      categories[category].subcategories!.forEach((subCategory) => {
        settingsNewObj[category].subCatObjs[subCategory] = categories[
          subCategory
        ] as GeneratedSubcategory;
        settingsNewObj[category].subCatObjs[subCategory].settingObjs = {};
        settingsNewObj[category].subCatObjs[subCategory].settings!.forEach((setting) => {
          settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting] = settings[setting];
          const { addon } = settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting];
          if (addon && addon.length) {
            addon.forEach((add) => {
              settingsNewObj[category].subCatObjs[subCategory].settingObjs[setting].addonObj =
                settings[add];
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
