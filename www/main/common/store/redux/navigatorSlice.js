/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice } from '@reduxjs/toolkit';

import { convertToCamelCase } from '../../utils';
import navigatorSettings from '../../../../configs/navigator-settings.json';

// Phase 4 of the easy-peasy → Redux migration: the `navigator` branch.
//
// Replaces createNavigatorSettingsState. Reducers are generated from the same
// config JSON (action names unchanged: `setActiveShabadId`, …) and are PURE.
// The old easy-peasy action's one side effect — broadcasting the change to the
// viewer window over `update-viewer-setting` — moves to settingsSyncMiddleware.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.

const initialState = {};
const reducers = {};
// action type (`navigator/setX`) → metadata the middleware needs to broadcast.
const actionMetaByType = {};

Object.keys(navigatorSettings).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey);
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  // navigator's config maps key → initial value directly.
  initialState[stateVarName] = navigatorSettings[settingKey];

  reducers[setFuncName] = (state, action) => {
    state[stateVarName] = action.payload;
  };

  actionMetaByType[`navigator/${setFuncName}`] = { stateVarName };
});

const navigatorSlice = createSlice({
  name: 'navigator',
  initialState,
  reducers,
});

// Generated action creators keyed by name — used by the inbound
// `update-global-setting` IPC listener to dispatch by name.
export const navigatorActions = navigatorSlice.actions;

// The same creators re-exported individually so call sites can import them by
// name. One per key in configs/navigator-settings.json.
export const {
  setCurrentSearchType,
  setSearchQuery,
  setInitialVerseId,
  setVerseHistory,
  setVersesRead,
  setSearchData,
  setHomeVerse,
  setCurrentLanguage,
  setCurrentSource,
  setCurrentRaag,
  setCurrentWriter,
  setActiveShabadId,
  setActiveVerseId,
  setSearchShabadsCount,
  setSavedCrossPlatformId,
  setHistoryOrder,
  setLineNumber,
  setIsMiscSlide,
  setMiscSlideText,
  setIsMiscSlideGurmukhi,
  setIsAnnouncement,
  setIsRandomShabad,
  setIsSundarGutkaBani,
  setSundarGutkaBaniId,
  setCeremonyId,
  setIsCeremonyBani,
  setSingleDisplayActiveTab,
  setShortcuts,
  setMinimizedBySingleDisplay,
  setIsDontSaveHistory,
  setFavShabad,
  setSearchVerse,
  setCurrentMiscPanel,
  setActivePaneId,
  setPane1,
  setPane2,
  setPane3,
  setDisabledContent,
  setFilteredBaniOptions,
} = navigatorSlice.actions;

// The initial state object, reused by the viewer window's shadow store.
export const NAVIGATOR_INITIAL_STATE = initialState;

// What settingsSyncMiddleware needs to broadcast navigator changes to the viewer.
export const NAVIGATOR_SYNC = { actionMetaByType };

export default navigatorSlice.reducer;
