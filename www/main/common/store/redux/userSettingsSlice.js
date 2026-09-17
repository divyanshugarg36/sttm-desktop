/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice } from '@reduxjs/toolkit';

import { convertToCamelCase } from '../../utils';
import { savedSettings, userConfigPath } from '../user-settings/get-saved-user-settings';

// Phase 4 of the easy-peasy → Redux migration: the `userSettings` branch.
//
// This replaces createUserSettingsState. The reducers are generated from the
// same config JSON so the action NAMES stay identical (`setLarivaar`, …) —
// call sites only swap the hook, not the action. Crucially the reducers are now
// PURE (`state[x] = payload`); every side effect the old easy-peasy action ran
// inline (IPC broadcast, fs/localStorage write, DOM class, global mutation,
// controller callback, socket emit) moves to settingsSyncMiddleware.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.
const { settings } = require('../../../../configs/user-settings.json');

const initialState = {};
const reducers = {};
// action type (`userSettings/setX`) → metadata the middleware needs to run the
// side effects for that setting.
const actionMetaByType = {};

Object.keys(settings).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey);
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  initialState[stateVarName] =
    typeof savedSettings[settingKey] === 'undefined'
      ? settings[settingKey].initialValue
      : savedSettings[settingKey];

  reducers[setFuncName] = (state, action) => {
    state[stateVarName] = action.payload;
  };

  actionMetaByType[`userSettings/${setFuncName}`] = {
    settingKey,
    stateVarName,
    schemaEntry: settings[settingKey],
  };
});

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers,
});

// The generated action creators, keyed by name (`setLarivaar` → creator). Used
// by the inbound `update-global-setting` IPC listener to dispatch by name.
export const userSettingsActions = userSettingsSlice.actions;

// The same generated action creators, re-exported individually so call sites can
// import them by name (`import { setTheme } from '.../userSettingsSlice'`). One
// per setting in configs/user-settings.json.
export const {
  setGurbaniFontSize,
  setContent1FontSize,
  setContent2FontSize,
  setContent3FontSize,
  setAnnouncementsFontSize,
  setResetFontSizes,
  setContent1Visibility,
  setContent2Visibility,
  setContent3Visibility,
  setContent1,
  setContent2,
  setContent3,
  setAkhandpatt,
  setDisplayNextLine,
  setLeftAlign,
  setLarivaar,
  setLarivaarAssist,
  setLarivaarAssistType,
  setDisplayVishraams,
  setVishraamType,
  setVishraamSource,
  setSlideTransitions,
  setResetPadding,
  setAutoplayToggle,
  setIntelligentSpacebar,
  setAutoplayDelay,
  setBaniLength,
  setMangalPosition,
  setTranslationLanguage,
  setTranslationEnglishSource,
  setTranslationHindiSource,
  setTeekaSource,
  setTransliterationLanguage,
  setQuickTools,
  setShortcutTray,
  setLiveFeed,
  setLimitChangeLog,
  setStatistics,
  setTheme,
  setThemeBg,
  setCurrentWorkspace,
  setDefaultPaneId,
} = userSettingsSlice.actions;

// The initial state object (camelCase key → value), reused by the viewer
// window's shadow store so it no longer has to read it off GlobalState.
export const USER_SETTINGS_INITIAL_STATE = initialState;

// Everything settingsSyncMiddleware needs to reproduce the old inline effects.
export const USER_SETTINGS_SYNC = {
  actionMetaByType,
  savedSettings,
  userConfigPath,
};

export default userSettingsSlice.reducer;
