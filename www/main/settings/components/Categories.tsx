import React from 'react';

import SettingRow from './SettingRow';
import { convertToCamelCase } from '../../common/utils';
import { i18n } from '../../common/main-app';
import { useAppSelector } from '../../common/store/redux/hooks';
import type { UserSettingsState } from '../../common/store/redux/userSettingsSlice';
import type { SettingsCategory, SettingsSubcategory } from '../utils/parse-settings';

type SettingsGroupProps = {
  id: string;
  group: SettingsSubcategory;
};

// A titled group of settings (a subcategory). A setting with a condition shows
// only while another setting has the given value, e.g. the vishraam options
// while vishraams are shown.
const SettingsGroup = ({ id, group }: SettingsGroupProps) => {
  const userSettings = useAppSelector((state) => state.userSettings);
  const settingKeys = Object.keys(group.settingObjs).filter((settingKey) => {
    const { condition, conditionValue } = group.settingObjs[settingKey];
    return (
      !condition ||
      userSettings[convertToCamelCase(condition) as keyof UserSettingsState] === conditionValue
    );
  });

  return (
    <section className="settings-group" id={id}>
      <h4 className="settings-group__title">{i18n.t(`SETTINGS.${group.title}`)}</h4>
      {settingKeys.map((settingKey) => (
        <SettingRow
          key={settingKey}
          settingKey={settingKey}
          settingObj={group.settingObjs[settingKey]}
        />
      ))}
    </section>
  );
};

type CategoriesProps = {
  category: SettingsCategory;
};

// A category's groups, one after another.
const Categories = ({ category }: CategoriesProps) =>
  Object.keys(category.subCatObjs).map((subCat) => (
    <SettingsGroup key={subCat} id={`settings-${subCat}`} group={category.subCatObjs[subCat]} />
  ));

export default Categories;
