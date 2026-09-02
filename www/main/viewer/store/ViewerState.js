import { createStore, action } from 'easy-peasy';
import GlobalState from '../../common/store/GlobalState';
import { USER_SETTINGS_INITIAL_STATE } from '../../common/store/redux/userSettingsSlice';

global.platform = require('../../desktop_scripts');

// Build the shadow set<Var> actions from a plain state object (key → value).
const createSettingsActions = (stateObject) => {
  const settingsActions = {};
  Object.keys(stateObject).forEach((stateVarName) => {
    // convert state name ex- larivaar to action name ex- setLarivaar
    const stateActionName = `set${stateVarName.charAt(0).toUpperCase()}${stateVarName.slice(1)}`;
    settingsActions[stateActionName] = action((state, payload) => {
      // eslint-disable-next-line no-param-reassign
      state[stateVarName] = payload;
    });
  });

  return settingsActions;
};

const ViewerState = createStore({
  // Shadow of userSettings — its initial values now come from the Redux slice's
  // shared initial-state export (userSettings left GlobalState in Phase 4); the
  // main window keeps this shadow in sync via `update-viewer-setting`.
  userSettings: {
    ...USER_SETTINGS_INITIAL_STATE,
    ...createSettingsActions(USER_SETTINGS_INITIAL_STATE),
  },
  // navigator is still an easy-peasy branch in GlobalState.
  navigator: {
    ...GlobalState.getState().navigator,
    ...createSettingsActions(GlobalState.getState().navigator),
  },
  viewerSettings: {
    containerPadding: {
      left: 48,
      top: 20,
      right: 0,
      bottom: 0,
    },
    quickToolsOpen: false,
    paddingToolsOpen: false,
    setQuickToolsOpen: action((state, payload) => {
      const newState = state;
      newState.paddingToolsOpen = false; // explictely making sure we are closing the paddingTools when setting the quick tools.
      newState.quickToolsOpen = payload;
      return newState;
    }),
    setPaddingToolsOpen: action((state, payload) => {
      const newState = state;
      newState.quickToolsOpen = false; // explictely making sure we are closing the quickTools when setting the padding tools.
      newState.paddingToolsOpen = payload;
      return newState;
    }),
    setPadding: action((state, payload) => {
      const newState = state;
      newState.containerPadding[payload.type] = payload.value;
      return newState;
    }),
  },
});

// Whenever a setting is changed in GlobalState, call the respective action here as well.
global.platform.ipc.on('update-viewer-setting', (_event, setting) => {
  const { actionName, payload, settingType } = JSON.parse(setting);
  ViewerState.getActions()[settingType][actionName](payload);
});

export default ViewerState;
