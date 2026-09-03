import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Switch, Checkbox } from '../../common/sttm-ui';
import { convertToCamelCase } from '../../common/utils';
import { settings } from '../../../configs/user-settings.json';
import { userSettingsActions } from '../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

const Setting = ({ settingObj, stateVar, stateFunction }) => {
  const { title, type, min, max, step, options } = settingObj;
  const userSettings = useSelector((state) => state.userSettings);
  const dispatch = useDispatch();
  const { containerPadding } = useSelector((state) => state.viewerSettings);

  const { disabledContent, filteredBaniOptions } = useSelector((state) => state.navigator);

  const handleInputChange = (event) => {
    const value = event.target ? event.target.value : event;
    const { disableSetting } = settingObj;
    dispatch(userSettingsActions[stateFunction](value));
    if (value && disableSetting) {
      if (userSettings[convertToCamelCase(disableSetting)] !== false) {
        dispatch(userSettingsActions[`set${convertToCamelCase(disableSetting, true)}`](false));
      }
    }
    analytics.trackEvent({
      category: 'setting',
      action: userSettingsActions[stateFunction],
      label: value,
    });
  };

  const handleCheckboxChange = (event) => {
    const value = event.target.checked;
    dispatch(userSettingsActions[stateFunction](value));
    analytics.trackEvent({
      category: 'setting',
      action: userSettingsActions[stateFunction],
      label: value,
    });
  };

  let settingDOM;

  const dropdownLabel = (option) => {
    if (option.includes('teeka')) {
      return i18n.t(`QUICK_TOOLS.TEEKA`);
    }
    if (option.includes('translation')) {
      return i18n.t(`QUICK_TOOLS.TRANSLATION`);
    }
    if (option.includes('transliteration')) {
      return i18n.t(`QUICK_TOOLS.TRANSLITERATION`);
    }
    return '';
  };

  const handleResetFontSizes = () => {
    const { resetSettings } = settingObj;
    if (resetSettings) {
      resetSettings.forEach((settingKey) => {
        const value = settings[settingKey].initialValue;
        if (userSettings[convertToCamelCase(settingKey)] !== value) {
          dispatch(userSettingsActions[`set${convertToCamelCase(settingKey, true)}`](value));
        }
      });
    }
  };

  const handleResetPadding = () => {
    const defaultPadding = {
      left: 48,
      top: 20,
      right: 0,
      bottom: 0,
    };
    Object.keys(containerPadding).forEach((key) => {
      if (containerPadding[key] !== defaultPadding[key]) {
        const payload = { type: key, value: defaultPadding[key] };
        global.platform.ipc.send(
          'update-global-setting',
          JSON.stringify({
            actionName: 'setPadding',
            payload,
            settingType: 'viewerSettings',
          }),
        );
      }
    });
  };

  const handleReset = (inputAction) => {
    if (inputAction === 'RESET_FONT_SIZES') {
      handleResetFontSizes();
    } else if (inputAction === 'RESET_PADDING') {
      handleResetPadding();
    }
    analytics.trackEvent({
      category: 'setting',
      action: inputAction,
      label: 'default',
    });
  };

  switch (type) {
    case 'range':
      settingDOM = (
        <>
          <p className="range-value">{userSettings[stateVar]}</p>
          <input
            type="range"
            data-value={userSettings[stateVar]}
            value={userSettings[stateVar]}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
          ></input>
        </>
      );
      break;
    case 'dropdown':
      settingDOM = (
        <select value={userSettings[stateVar]} onChange={handleInputChange}>
          {Object.keys(options).map((op, opIndex) => (
            <option key={`control-dropdown-options-${opIndex}`} value={op}>
              {i18n.t(`SETTINGS.${options[op]}`)}
            </option>
          ))}
        </select>
      );
      break;
    case 'switch':
      settingDOM = (
        <Switch
          controlId={`${title}-switch`}
          className={`control-item-switch-${title}`}
          value={userSettings[stateVar]}
          onToggle={handleInputChange}
          disabled={userSettings[convertToCamelCase(settingObj.disableWhen)]}
        />
      );
      break;
    case 'checkbox':
      settingDOM = (
        <Checkbox
          id={`${title}-checkbox`}
          name={`control-item-checkbox-${title}`}
          handler={handleCheckboxChange}
          checked={userSettings[stateVar]}
        />
      );
      break;
    case 'bani-options-dropdown':
      settingDOM = (
        <>
          <select
            value={userSettings[stateVar]}
            onChange={handleInputChange}
            style={{ marginRight: '8px' }}
          >
            {filteredBaniOptions.map((optionObj, optionIndex) => (
              <optgroup key={`option-${optionIndex}`} label={dropdownLabel(optionObj.label)}>
                {optionObj.options.map((optionName, nameIndex) => (
                  <option
                    key={`option-name-${nameIndex}`}
                    value={optionName.id}
                    disabled={disabledContent.includes(optionName.id)}
                  >
                    {optionName.text}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span>{dropdownLabel(userSettings[stateVar])}</span>
        </>
      );
      break;
    case 'reset-button':
      settingDOM = (
        <button
          onClick={() => {
            handleReset(title);
          }}
          className="icon-reset"
        >
          <img src="assets/img/icons/reset-transparent.svg" alt="Reset Font Sizes to Default" />
          <span>{i18n.t(`SETTINGS.${title}`)}</span>
        </button>
      );
      break;
    default:
      return null;
  }

  return settingDOM;
};

Setting.propTypes = {
  settingObj: PropTypes.object,
  stateVar: PropTypes.string,
  stateFunction: PropTypes.string,
};

export default Setting;
