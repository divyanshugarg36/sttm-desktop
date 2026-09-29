import React from 'react';
import type { UnknownAction } from '@reduxjs/toolkit';
import { PrimaryButton, SimpleSelect, Toggle } from '@khalisfoundation/sikhi-ui';
import LayoutSelector from './LayoutSelector';
import { getDefaultSettings } from '../../common/store/user-settings/get-saved-overlay-settings';
import { convertToCamelCase } from '../../common/utils';
import {
  baniOverlayActions,
  type BaniOverlayState,
} from '../../common/store/redux/baniOverlaySlice';
import type { GeneratedSetting } from '../../common/utils/settings-obj-generator';
import Icon from '../../common/sttm-ui/icon';
import { useOverlayDispatch, useOverlaySelector } from '../store/hooks';

/** A setting in configs/overlay.json (the sidebar's or the bottom bar's). */
export type OverlaySettingConfig = GeneratedSetting & {
  title?: string;
  options?: Record<string, string>;
  tooltip?: string;
  icon?: string;
  /** The custom control to show (type 'custom'). */
  key?: string;
  /** Settings switched off when this one changes (e.g. fit text, by a size). */
  disableOnChange?: string[];
};

/** The baniOverlay setters, looked up by name (`setLayout`, …). */
const settersByName = baniOverlayActions as unknown as Record<
  string,
  (payload: unknown) => UnknownAction
>;

type OverlaySettingProps = {
  settingObj: OverlaySettingConfig;
  stateVar: keyof BaniOverlayState;
  stateFunction: string;
};

const OverlaySetting = ({ settingObj, stateVar, stateFunction }: OverlaySettingProps) => {
  const { title, type } = settingObj;
  const baniOverlayState = useOverlaySelector((state) => state.baniOverlay);
  const dispatch = useOverlayDispatch();

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { value } = event.target;
    dispatch(settersByName[stateFunction](value));
  };

  const handleSizeIcon = (event: React.MouseEvent<HTMLElement>) => {
    const { max, min, step } = settingObj;
    const { value } = event.currentTarget.dataset;
    const currentValue = baniOverlayState[stateVar] as number;
    let updatedValue;

    if (value === 'plus' && currentValue < max!) {
      updatedValue = currentValue + step!;
      dispatch(settersByName[stateFunction](updatedValue));
    } else if (value === 'minus' && currentValue > min!) {
      updatedValue = currentValue - step!;
      dispatch(settersByName[stateFunction](updatedValue));
    }

    if (settingObj.disableOnChange && settingObj.disableOnChange.length > 0) {
      settingObj.disableOnChange.forEach((disableSetting) => {
        const disabledSetting = convertToCamelCase(disableSetting) as keyof BaniOverlayState;
        const setDisabledSetting = `set${convertToCamelCase(disableSetting, true)}`;
        if (baniOverlayState[disabledSetting] !== false) {
          dispatch(settersByName[setDisabledSetting](false));
        }
      });
    }
  };

  const handleToggleChange = () => {
    if (stateVar === 'reset') {
      const defaultSettings = getDefaultSettings();
      (Object.keys(baniOverlayState) as (keyof BaniOverlayState)[]).forEach((state) => {
        if (baniOverlayState[state] !== defaultSettings[state]) {
          dispatch(settersByName[`set${convertToCamelCase(state, true)}`](defaultSettings[state]));
        }
      });
    } else {
      const existingValue = baniOverlayState[stateVar];
      dispatch(settersByName[stateFunction](!existingValue));
    }
  };

  const handleLayoutChange = (event: React.MouseEvent<HTMLElement>) => {
    const currentLayout = baniOverlayState[stateVar];
    const newLayout = event.currentTarget.dataset.layout;
    if (newLayout !== currentLayout) {
      dispatch(settersByName[stateFunction](newLayout));
    }
  };

  const handleFormatIcon = (event: React.MouseEvent<HTMLElement>) => {
    const clickedEvent = event.currentTarget.dataset.value as keyof BaniOverlayState['textFormat'];
    const currentFormat = { ...(baniOverlayState[stateVar] as BaniOverlayState['textFormat']) };
    currentFormat[clickedEvent] = !currentFormat[clickedEvent];
    dispatch(settersByName[stateFunction](currentFormat));
  };

  // A round icon button, pressed when `isOn`.
  const iconButton = (
    label: string,
    content: React.ReactNode,
    onClick: React.MouseEventHandler<HTMLButtonElement>,
    isOn = false,
    data: Record<string, string> = {},
  ) => (
    <PrimaryButton
      variant={isOn ? 'default' : 'outline'}
      mode="icon"
      size="sm"
      shape="circle"
      aria-label={label}
      aria-pressed={isOn}
      title={label}
      onClick={onClick}
      {...data}
    >
      {content}
    </PrimaryButton>
  );

  switch (type) {
    case 'dropdown':
      return (
        <SimpleSelect
          variant="bordered"
          selectSize="sm"
          value={baniOverlayState[stateVar] as string}
          onChange={handleInputChange}
          options={Object.entries(settingObj.options!).map(([value, label]) => ({ value, label }))}
        />
      );
    case 'color-input':
      return (
        <input
          type="color"
          className="overlay-color-input"
          onChange={handleInputChange}
          value={baniOverlayState[stateVar] as string}
        />
      );
    case 'size-icon':
      return (
        <span className="overlay-control-group">
          {iconButton('Smaller', <Icon name="minus" />, handleSizeIcon, false, {
            'data-value': 'minus',
          })}
          {iconButton('Larger', <Icon name="plus" />, handleSizeIcon, false, {
            'data-value': 'plus',
          })}
        </span>
      );
    case 'text-format-icon': {
      const textFormat = baniOverlayState[stateVar] as BaniOverlayState['textFormat'];
      return (
        <span className="overlay-control-group">
          {iconButton('Bold', <Icon name="bold" />, handleFormatIcon, textFormat.bold, {
            'data-value': 'bold',
          })}
          {iconButton('Italic', <Icon name="italic" />, handleFormatIcon, textFormat.italic, {
            'data-value': 'italic',
          })}
        </span>
      );
    }
    case 'icon-toggle':
      return iconButton(
        settingObj.tooltip ?? '',
        <span
          className="overlay-icon-toggle"
          style={{ backgroundImage: `url('assets/img/icons/${settingObj.icon}')` }}
        />,
        handleToggleChange,
        stateVar !== 'reset' && !!baniOverlayState[stateVar],
      );
    case 'switch':
      return (
        <Toggle
          id={`${title}-switch`}
          size="lg"
          checked={!!baniOverlayState[stateVar]}
          onChange={handleToggleChange}
        />
      );
    case 'custom':
      return settingObj.key === 'LayoutSelector' ? (
        <LayoutSelector
          current={baniOverlayState[stateVar] as string}
          changeLayout={handleLayoutChange}
        />
      ) : null;
    default:
      return null;
  }
};

export default OverlaySetting;
