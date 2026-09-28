import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import SettingRow from './SettingRow';
import { convertToCamelCase } from '../../common/utils';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

// A titled group of settings (a subcategory). A setting with a condition shows
// only while another setting has the given value, e.g. the vishraam options
// while vishraams are shown.
const SettingsGroup = ({ id, group }) => {
  const userSettings = useSelector((state) => state.userSettings);
  const settingKeys = Object.keys(group.settingObjs).filter((settingKey) => {
    const { condition, conditionValue } = group.settingObjs[settingKey];
    return !condition || userSettings[convertToCamelCase(condition)] === conditionValue;
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

SettingsGroup.propTypes = {
  id: PropTypes.string,
  group: PropTypes.object,
};

// A category's groups, one after another.
const Categories = ({ category }) =>
  Object.keys(category.subCatObjs).map((subCat) => (
    <SettingsGroup key={subCat} id={`settings-${subCat}`} group={category.subCatObjs[subCat]} />
  ));

Categories.propTypes = {
  category: PropTypes.object,
};

export default Categories;
