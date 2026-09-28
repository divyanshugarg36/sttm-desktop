import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { PrimaryButton, Range, SimpleSelect, Toggle } from '@khalisfoundation/sikhi-ui';

import { Icon } from '../../common/sttm-ui';
import { contentLabelKey, convertToCamelCase, toGroupedSelectOptions } from '../../common/utils';
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

  let settingDOM;

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
          <span className="setting-row__value">{userSettings[stateVar]}</span>
          <Range
            className="setting-row__range"
            value={Number(userSettings[stateVar])}
            min={min}
            max={max}
            step={step}
            showTicks={false}
            onChange={handleInputChange}
            inputProps={{ 'aria-label': i18n.t(`SETTINGS.${title}`) }}
          />
        </>
      );
      break;
    case 'dropdown':
      settingDOM = (
        <SimpleSelect
          className="setting-row__select"
          variant="bordered"
          selectSize="sm"
          value={userSettings[stateVar]}
          onChange={handleInputChange}
          options={Object.keys(options).map((op) => ({
            value: op,
            label: i18n.t(`SETTINGS.${options[op]}`),
          }))}
        />
      );
      break;
    case 'switch':
      settingDOM = (
        <Toggle
          id={`${title}-switch`}
          size="lg"
          checked={!!userSettings[stateVar]}
          onChange={(event) => handleInputChange(event.target.checked)}
          disabled={!!userSettings[convertToCamelCase(settingObj.disableWhen)]}
        />
      );
      break;
    // A content line's visibility, as an eye like the viewer's Quick Tools.
    case 'checkbox': {
      const isVisible = !!userSettings[stateVar];
      settingDOM = (
        <PrimaryButton
          variant="ghost"
          mode="icon"
          size="sm"
          aria-label={isVisible ? 'Hide this line' : 'Show this line'}
          aria-pressed={isVisible}
          onClick={() => handleInputChange(!isVisible)}
        >
          <Icon name={isVisible ? 'eye' : 'eye-off'} />
        </PrimaryButton>
      );
      break;
    }
    case 'bani-options-dropdown':
      settingDOM = (
        <SimpleSelect
          className="setting-row__content"
          variant="bordered"
          selectSize="sm"
          value={userSettings[stateVar]}
          onChange={handleInputChange}
          options={toGroupedSelectOptions(filteredBaniOptions, {
            groupLabel: (option) => i18n.t(contentLabelKey(option)),
            isDisabled: (id) => disabledContent.includes(id),
          })}
        />
      );
      break;
    case 'reset-button':
      settingDOM = (
        <PrimaryButton
          variant="outline"
          size="sm"
          leftIcon={<Icon name="reset" />}
          onClick={() => {
            handleReset(title);
          }}
        >
          {i18n.t(`SETTINGS.${title}`)}
        </PrimaryButton>
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
