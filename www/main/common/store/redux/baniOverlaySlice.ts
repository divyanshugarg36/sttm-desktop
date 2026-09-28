/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';

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

/** The bani overlay (OBS) settings, one field per setting in configs/overlay.json. */
export interface BaniOverlayState {
  gurbaniTextColor: string;
  gurbaniFont: string;
  overlayLarivaar: boolean;
  fitTextSwitch: boolean;
  toggleAnnouncement: boolean;
  larivaarAssist: boolean;
  gurbaniSize: number;
  textColor: string;
  textFont: string;
  textSize: number;
  textFormat: { bold: boolean; italic: boolean };
  bgColor: string;
  padding: number;
  bgOpacity: number;
  overlayTheme: string;
  dateFormat: string;
  timeFormat: string;
  reset: boolean;
  layout: string;
  toggleLogo: boolean;
  toggleLink: boolean;
  greenScreenToggle: boolean;
}

/** The setter action for each field: `layout` → `setLayout(payload)`. */
type SettersOf<S> = {
  [K in keyof S & string as `set${Capitalize<K>}`]: CaseReducer<S, PayloadAction<S[K]>>;
};

const schema: Record<string, { initialValue?: unknown }> = {
  ...sidebar.settings,
  ...bottomBar.settings,
};
const savedBaniOverlay: Record<string, unknown> = savedOverlaySettings.baniOverlay || {};

const initialState = {} as Record<string, unknown>;
const reducers: Record<string, CaseReducer<BaniOverlayState, PayloadAction<unknown>>> = {};
// action type (`baniOverlay/setX`) → metadata the main middleware needs to persist.
const actionMetaByType: Record<
  string,
  { settingKey: string; stateVarName: keyof BaniOverlayState }
> = {};

Object.keys(schema).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey) as keyof BaniOverlayState;
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  // Mirrors createOverlaySettingsState (uses `||`, so falsy saved values fall
  // back to the default — preserved verbatim).
  initialState[stateVarName] = savedBaniOverlay[settingKey] || schema[settingKey].initialValue;

  reducers[setFuncName] = (state, action) => {
    (state as Record<string, unknown>)[stateVarName] = action.payload;
  };

  actionMetaByType[`baniOverlay/${setFuncName}`] = { settingKey, stateVarName };
});

const baniOverlaySlice = createSlice({
  name: 'baniOverlay',
  initialState: initialState as unknown as BaniOverlayState,
  reducers: reducers as unknown as SettersOf<BaniOverlayState>,
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
export const BANI_OVERLAY_INITIAL_STATE = initialState as unknown as BaniOverlayState;

// What the main window's settingsSyncMiddleware needs to persist baniOverlay.
export const BANI_OVERLAY_SYNC = { actionMetaByType };

export default baniOverlaySlice.reducer;
