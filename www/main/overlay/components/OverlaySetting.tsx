import React from 'react';
import type { UnknownAction } from '@reduxjs/toolkit';
import { SimpleSelect } from '@khalisfoundation/sikhi-ui';
import LayoutSelector from './LayoutSelector';
import { getDefaultSettings } from '../../common/store/user-settings/get-saved-overlay-settings';
import { convertToCamelCase } from '../../common/utils';
import {
  baniOverlayActions,
  type BaniOverlayState,
} from '../../common/store/redux/baniOverlaySlice';
import type { GeneratedSetting } from '../../common/utils/settings-obj-generator';
import Icon from '../../common/sttm-ui/icon';
import Switch from '../../common/sttm-ui/switch';
import { i18n } from '../../common/main-app';
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

  const handleSizeIcon = (event: React.MouseEvent<HTMLDivElement>) => {
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

  const handleLayoutChange = (event: React.MouseEvent<HTMLDivElement>) => {
    const currentLayout = baniOverlayState[stateVar];
    const newLayout = event.currentTarget.dataset.layout;
    if (newLayout !== currentLayout) {
      dispatch(settersByName[stateFunction](newLayout));
    }
  };

  const handleFormatIcon = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedEvent = event.currentTarget.dataset.value as keyof BaniOverlayState['textFormat'];
    const currentFormat = { ...(baniOverlayState[stateVar] as BaniOverlayState['textFormat']) };
    currentFormat[clickedEvent] = !currentFormat[clickedEvent];
    dispatch(settersByName[stateFunction](currentFormat));
  };

  const settingDOM: React.ReactElement[] = [];

  if (title) {
    settingDOM.push(<span>{i18n.t(`BANI_OVERLAY.${title}`)}</span>);
  }

  switch (type) {
    case 'dropdown':
      settingDOM.push(
        <SimpleSelect
          variant="bordered"
          selectSize="sm"
          value={baniOverlayState[stateVar] as string}
          onChange={handleInputChange}
          options={Object.entries(settingObj.options!).map(([value, label]) => ({ value, label }))}
        />,
      );
      break;
    case 'color-input':
      settingDOM.push(
        <input
          type="color"
          className={`control-color-input-${title}`}
          onChange={handleInputChange}
          value={baniOverlayState[stateVar] as string}
        />,
      );
      break;
    case 'size-icon':
      settingDOM.push(
        <span className={`size-icon-container`}>
          <div className="size-icon icon-left" data-value="plus" onClick={handleSizeIcon}>
            <Icon name="plus" />
          </div>
          <div className="size-icon icon-right" data-value="minus" onClick={handleSizeIcon}>
            <Icon name="minus" />
          </div>
        </span>,
      );
      break;
    case 'text-format-icon': {
      const textFormat = baniOverlayState[stateVar] as BaniOverlayState['textFormat'];
      settingDOM.push(
        <span className={`text-icon-container`}>
          <div
            className={`text-icon icon-bold ${textFormat.bold && 'active'}`}
            data-value="bold"
            onClick={handleFormatIcon}
          >
            <Icon name="bold" />
          </div>
          <div
            className={`text-icon icon-italic ${textFormat.italic && 'active'}`}
            data-value="italic"
            onClick={handleFormatIcon}
          >
            <Icon name="italic" />
          </div>
        </span>,
      );
      break;
    }
    case 'icon-toggle':
      settingDOM.push(
        <div className="size-icon-container" onClick={handleToggleChange}>
          <span
            className="icon-toggle"
            title={settingObj.tooltip}
            style={{
              backgroundImage: `url('assets/img/icons/${settingObj.icon}')`,
            }}
          ></span>
        </div>,
      );
      break;
    case 'switch':
      settingDOM.push(
        <Switch
          controlId={`${title}-switch`}
          className={`control-item-switch`}
          value={baniOverlayState[stateVar] as boolean}
          onToggle={handleToggleChange}
        />,
      );
      break;
    case 'custom':
      if (settingObj.key === 'LayoutSelector') {
        settingDOM.push(<LayoutSelector changeLayout={handleLayoutChange} />);
      }
      break;
    default:
      return null;
  }
  return settingDOM;
};

export default OverlaySetting;
