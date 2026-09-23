/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice } from '@reduxjs/toolkit';

import { convertToCamelCase } from '../../utils';
import { savedOverlaySettings } from '../user-settings/get-saved-overlay-settings';
import overlayConfig from '../../../../configs/overlay.json';

// Phase 6 of the easy-peasy → Redux migration: the `baniOverlay` branch (used by
// the main window AND the overlay window). Replaces createOverlaySettingsState.
// Reducers are generated from the overlay config JSON (action names unchanged)
// and are PURE. The side effects differ per window and live in middleware:
//   - main window: persist to the user config file + `save-overlay-settings` IPC
//     (settingsSyncMiddleware).
//   - overlay window: broadcast `update-global-setting` to the main window
//     (overlay-store's own middleware).
// See EASY-PEASY-TO-REDUX-MIGRATION.md.
const { sidebar, bottomBar } = overlayConfig;

const schema = { ...sidebar.settings, ...bottomBar.settings };
const savedBaniOverlay = savedOverlaySettings.baniOverlay || {};

const initialState = {};
const reducers = {};
// action type (`baniOverlay/setX`) → metadata the main middleware needs to persist.
const actionMetaByType = {};

Object.keys(schema).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey);
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  // Mirrors createOverlaySettingsState (uses `||`, so falsy saved values fall
  // back to the default — preserved verbatim).
  initialState[stateVarName] = savedBaniOverlay[settingKey] || schema[settingKey].initialValue;

  reducers[setFuncName] = (state, action) => {
    state[stateVarName] = action.payload;
  };

  actionMetaByType[`baniOverlay/${setFuncName}`] = { settingKey, stateVarName };
});

const baniOverlaySlice = createSlice({
  name: 'baniOverlay',
  initialState,
  reducers,
});

// Generated action creators keyed by name — used by the inbound
// `update-global-setting` IPC listener (main) to dispatch by name.
export const baniOverlayActions = baniOverlaySlice.actions;

export const {
  setGurbaniTextColor,
  setGurbaniFont,
  setOverlayLarivaar,
  setFitTextSwitch,
  setToggleAnnouncement,
  setLarivaarAssist,
  setGurbaniSize,
  setTextColor,
  setTextFont,
  setTextSize,
  setTextFormat,
  setBgColor,
  setPadding,
  setBgOpacity,
  setOverlayTheme,
  setDateFormat,
  setTimeFormat,
  setReset,
  setLayout,
  setToggleLogo,
  setToggleLink,
  setGreenScreenToggle,
} = baniOverlaySlice.actions;

// Initial state, reused by the overlay window's store.
export const BANI_OVERLAY_INITIAL_STATE = initialState;

// What the main window's settingsSyncMiddleware needs to persist baniOverlay.
export const BANI_OVERLAY_SYNC = { actionMetaByType };

export default baniOverlaySlice.reducer;
