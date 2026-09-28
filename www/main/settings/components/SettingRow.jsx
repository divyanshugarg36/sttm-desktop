import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Setting from './Setting';
import { contentLabelKey, convertToCamelCase } from '../../common/utils';

const remote = require('@electron/remote');

const { store, i18n } = remote.require('./app');

// The control for one setting (or one of its addons), wired to its userSettings
// value and setter.
const control = (settingKey, settingObj) => (
  <Setting
    settingObj={settingObj}
    stateVar={convertToCamelCase(settingKey)}
    stateFunction={`set${convertToCamelCase(settingKey, true)}`}
  />
);

// A settings row: the setting's name with a note under it, then its control.
// The slide's content lines' font sizes carry two addons, shown before the
// size: whether the line is visible, and which content it shows; the row is
// named after that content.
const SettingRow = ({ settingKey, settingObj }) => {
  const userSettings = useSelector((state) => state.userSettings);
  const { title, notes, type, initialValue, addon = [], addonObj = [] } = settingObj;

  if (type === 'reset-button') {
    return (
      <div className="setting-row setting-row--action" id={settingKey}>
        {control(settingKey, settingObj)}
      </div>
    );
  }

  const addons = addon.map((key, index) => ({ key, obj: addonObj[index] }));
  const visibility = addons.find(({ obj }) => obj.type === 'checkbox');
  const content = addons.find(({ obj }) => obj.type === 'bani-options-dropdown');

  const name = content
    ? i18n.t(contentLabelKey(userSettings[convertToCamelCase(content.key)]))
    : title && i18n.t(`SETTINGS.${title}`);
  const note = [
    notes && i18n.t(`SETTINGS.${notes}`),
    type === 'range' && `Default: ${initialValue}`,
    settingObj.store && store.get(settingObj.store),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="setting-row" id={settingKey}>
      <div className="setting-row__label">
        <span className="setting-row__title">{name}</span>
        {note && <span className="setting-row__note">{note}</span>}
      </div>
      <div className="setting-row__control">
        {visibility && control(visibility.key, visibility.obj)}
        {content && control(content.key, content.obj)}
        {control(settingKey, settingObj)}
      </div>
    </div>
  );
};

SettingRow.propTypes = {
  settingKey: PropTypes.string,
  settingObj: PropTypes.object,
};

export default SettingRow;
