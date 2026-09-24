import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import LayoutSelector from './LayoutSelector';
import { getDefaultSettings } from '../../common/store/user-settings/get-saved-overlay-settings';
import { convertToCamelCase } from '../../common/utils';
import { baniOverlayActions } from '../../common/store/redux/baniOverlaySlice';
import { Icon, Switch } from '../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const OverlaySetting = ({ settingObj, stateVar, stateFunction }) => {
  const { title, type } = settingObj;
  const baniOverlayState = useSelector((state) => state.baniOverlay);
  const dispatch = useDispatch();

  const handleInputChange = (event) => {
    const value = event.target ? event.target.value : event;
    dispatch(baniOverlayActions[stateFunction](value));
  };

  const handleSizeIcon = (event) => {
    const { max, min, step } = settingObj;
    const value = event.currentTarget ? event.currentTarget.dataset.value : event;
    const currentValue = baniOverlayState[stateVar];
    let updatedValue;

    if (value === 'plus' && currentValue < max) {
      updatedValue = currentValue + step;
      dispatch(baniOverlayActions[stateFunction](updatedValue));
    } else if (value === 'minus' && currentValue > min) {
      updatedValue = baniOverlayState[stateVar] - step;
      dispatch(baniOverlayActions[stateFunction](updatedValue));
    }

    if (settingObj?.disableOnChange?.length > 0) {
      settingObj.disableOnChange.forEach((disableSetting) => {
        const disabledSetting = convertToCamelCase(disableSetting);
        const setDisabledSetting = `set${convertToCamelCase(disableSetting, true)}`;
        if (baniOverlayState[disabledSetting] !== false) {
          dispatch(baniOverlayActions[setDisabledSetting](false));
        }
      });
    }
  };

  const handleToggleChange = () => {
    if (stateVar === 'reset') {
      const defaultSettings = getDefaultSettings();
      Object.keys(baniOverlayState).forEach((state) => {
        if (baniOverlayState[state] !== defaultSettings[state]) {
          dispatch(baniOverlayActions[`set${convertToCamelCase(state, true)}`](defaultSettings[state]));
        }
      });
    } else {
      const existingValue = baniOverlayState[stateVar];
      dispatch(baniOverlayActions[stateFunction](!existingValue));
    }
  };

  const handleLayoutChange = (event) => {
    const currentLayout = baniOverlayState[stateVar];
    const newLayout = event.currentTarget.dataset.layout;
    if (newLayout !== currentLayout) {
      dispatch(baniOverlayActions[stateFunction](newLayout));
    }
  };

  const handleFormatIcon = (event) => {
    const clickedEvent = event.currentTarget ? event.currentTarget.dataset.value : event;
    const currentFormat = { ...baniOverlayState[stateVar] };
    currentFormat[clickedEvent] = !currentFormat[clickedEvent];
    dispatch(baniOverlayActions[stateFunction](currentFormat));
  };

  const settingDOM = [];

  if (title) {
    settingDOM.push(<span>{i18n.t(`BANI_OVERLAY.${title}`)}</span>);
  }

  switch (type) {
    case 'dropdown':
      settingDOM.push(
        <select onChange={handleInputChange} value={baniOverlayState[stateVar]}>
          {Object.keys(settingObj.options).map((op, opIndex) => (
            <option key={`control-dropdown-options-${opIndex}`} value={op}>
              {settingObj.options[op]}
            </option>
          ))}
        </select>,
      );
      break;
    case 'color-input':
      settingDOM.push(
        <input
          type="color"
          className={`control-color-input-${title}`}
          onChange={handleInputChange}
          value={baniOverlayState[stateVar]}
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
    case 'text-format-icon':
      settingDOM.push(
        <span className={`text-icon-container`}>
          <div
            className={`text-icon icon-bold ${baniOverlayState[stateVar].bold && 'active'}`}
            data-value="bold"
            onClick={handleFormatIcon}
          >
            <Icon name="bold" />
          </div>
          <div
            className={`text-icon icon-italic ${baniOverlayState[stateVar].italic && 'active'}`}
            data-value="italic"
            onClick={handleFormatIcon}
          >
            <Icon name="italic" />
          </div>
        </span>,
      );
      break;
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
          value={baniOverlayState[stateVar]}
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

OverlaySetting.propTypes = {
  settingObj: PropTypes.object,
  stateVar: PropTypes.string,
  stateFunction: PropTypes.string,
};

export default OverlaySetting;
