import React from 'react';
import type { UnknownAction } from '@reduxjs/toolkit';
import { PrimaryButton, Range, SimpleSelect, Toggle } from '@khalisfoundation/sikhi-ui';

import { Icon } from '../../common/sttm-ui';
import { contentLabelKey, convertToCamelCase, toGroupedSelectOptions } from '../../common/utils';
import userSettingsConfig from '../../../configs/user-settings.json';
import {
  userSettingsActions,
  type UserSettingsState,
} from '../../common/store/redux/userSettingsSlice';
import type { ContainerPadding } from '../../common/store/redux/viewerSettingsSlice';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import { analytics, i18n } from '../../common/main-app';
import { sendGlobalSetting } from '../../common/ipc';
import type { SettingConfig } from '../utils/parse-settings';

const settings = userSettingsConfig.settings as Record<string, SettingConfig>;

/** The userSettings setters, looked up by name (`setLarivaar`, …). */
const settersByName = userSettingsActions as unknown as Record<
  string,
  (payload: unknown) => UnknownAction
>;

/** What a control reports: a dropdown's change event, or a range's / switch's value. */
type SettingInput = React.ChangeEvent<HTMLSelectElement> | number | boolean;

type SettingProps = {
  settingObj: SettingConfig;
  stateVar: keyof UserSettingsState;
  stateFunction: string;
};

const Setting = ({ settingObj, stateVar, stateFunction }: SettingProps) => {
  const { title, type, min, max, step, options } = settingObj;
  const userSettings = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();
  const { containerPadding } = useAppSelector((state) => state.viewerSettings);

  const { disabledContent, filteredBaniOptions } = useAppSelector((state) => state.navigator);

  /** Another setting's value, by its key in configs/user-settings.json. */
  const settingValue = (settingKey: string) =>
    userSettings[convertToCamelCase(settingKey) as keyof UserSettingsState];

  const handleInputChange = (event: SettingInput) => {
    const value = typeof event === 'object' ? event.target.value : event;
    const { disableSetting } = settingObj;
    dispatch(settersByName[stateFunction](value));
    if (value && disableSetting) {
      if (settingValue(disableSetting) !== false) {
        dispatch(settersByName[`set${convertToCamelCase(disableSetting, true)}`](false));
      }
    }
    analytics.trackEvent({
      category: 'setting',
      action: stateFunction,
      label: value,
    });
  };

  let settingDOM;

  const handleResetFontSizes = () => {
    const { resetSettings } = settingObj;
    if (resetSettings) {
      resetSettings.forEach((settingKey) => {
        const value = settings[settingKey].initialValue;
        if (settingValue(settingKey) !== value) {
          dispatch(settersByName[`set${convertToCamelCase(settingKey, true)}`](value));
        }
      });
    }
  };

  const handleResetPadding = () => {
    const defaultPadding: ContainerPadding = {
      left: 48,
      top: 20,
      right: 0,
      bottom: 0,
    };
    (Object.keys(containerPadding) as (keyof ContainerPadding)[]).forEach((key) => {
      if (containerPadding[key] !== defaultPadding[key]) {
        const payload = { type: key, value: defaultPadding[key] };
        sendGlobalSetting('setPadding', payload, 'viewerSettings');
      }
    });
  };

  const handleReset = (inputAction: string) => {
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
          <span className="setting-row__value">{userSettings[stateVar] as number}</span>
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
          value={userSettings[stateVar] as string}
          onChange={handleInputChange}
          options={Object.keys(options!).map((op) => ({
            value: op,
            label: i18n.t(`SETTINGS.${options![op]}`),
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
          disabled={!!settingValue(settingObj.disableWhen ?? '')}
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
          value={userSettings[stateVar] as string}
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
            // Every reset button in the config has a title (its action).
            handleReset(title!);
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

export default Setting;
