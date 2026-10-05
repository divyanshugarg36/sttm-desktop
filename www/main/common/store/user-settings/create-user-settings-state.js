import { action } from 'easy-peasy';
import { convertToCamelCase, clampFontSize, isFontSizeSetting } from '../../utils';
import { getControllerFontSizes } from '../../../addons/bani-controller/utils/controller-font-sizes';

// can we change them to import?
const fs = require('fs');

const createUserSettingsState = (settingsSchema, savedSettings, userConfigPath) => {
  const userSettingsState = {};
  Object.keys(settingsSchema).forEach((settingKey) => {
    const stateVarName = convertToCamelCase(settingKey);
    const stateFuncName = `set${convertToCamelCase(settingKey, true)}`;

    const { initialValue } = settingsSchema[settingKey];
    const isFontSize = isFontSizeSetting(settingKey);

    if (typeof savedSettings[settingKey] === 'undefined') {
      userSettingsState[stateVarName] = initialValue;
    } else if (isFontSize) {
      // A size saved out of range (older versions, a hand-edited file) would be
      // drawn as-is on the first slide.
      userSettingsState[stateVarName] = clampFontSize(savedSettings[settingKey], initialValue);
    } else {
      userSettingsState[stateVarName] = savedSettings[settingKey];
    }

    userSettingsState[stateFuncName] = action((state, rawPayload) => {
      const oldValue = state[stateVarName];
      // Every font size change (Settings, Quick Tools, the Bani Controller's +/-)
      // stays within range; the controller's buttons aren't capped on their own.
      const payload = isFontSize ? clampFontSize(rawPayload, oldValue) : rawPayload;
      // eslint-disable-next-line no-param-reassign
      state[stateVarName] = payload;
      if (global.webview) {
        global.webview.send(
          'update-viewer-setting',
          JSON.stringify({
            stateName: stateVarName,
            payload,
            oldValue,
            actionName: stateFuncName,
            settingType: 'userSettings',
          }),
        );
      }

      if (global.platform) {
        global.platform.ipc.send(
          'update-viewer-setting',
          JSON.stringify({
            stateName: stateVarName,
            payload,
            oldValue,
            actionName: stateFuncName,
            settingType: 'userSettings',
          }),
        );
      }

      // Save settings to file
      const updatedSettings = savedSettings;
      updatedSettings[settingKey] = payload;
      fs.writeFileSync(userConfigPath, JSON.stringify(updatedSettings));

      // Update localStorage
      if (typeof localStorage === 'object') {
        localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
      }

      // Update global object
      global.getUserSettings[stateVarName] = payload;

      // Update DOM if ready
      if (document && !settingsSchema[settingKey].dontApplyClass) {
        document.body.classList.remove(`${settingKey}-${oldValue}`);
        document.body.classList.add(`${settingKey}-${payload}`);
      }

      // Run the sideeffects
      if (typeof global.controller[settingKey] === 'function') {
        global.controller[settingKey](payload);
      }

      const fontSizes = getControllerFontSizes(global.getUserSettings);

      if (window.socket !== undefined && window.socket !== null) {
        window.socket.emit('data', {
          host: 'sttm-desktop',
          type: 'settings',
          settings: {
            fontSizes,
          },
        });
      }
      // No `return state`: returning the draft left a revoked proxy in the store
      // when nothing changed (the same value again), and every later setting
      // change then threw.
    });
  });
  return userSettingsState;
};

export default createUserSettingsState;
