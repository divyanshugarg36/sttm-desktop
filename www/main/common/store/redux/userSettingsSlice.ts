/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';

import { convertToCamelCase } from '../../utils';
import { savedSettings, userConfigPath } from '../user-settings/get-saved-user-settings';
import userSettingsConfig from '../../../../configs/user-settings.json';

// Phase 4 of the easy-peasy → Redux migration: the `userSettings` branch.
//
// This replaces createUserSettingsState. The reducers are generated from the
// same config JSON so the action NAMES stay identical (`setLarivaar`, …) —
// call sites only swap the hook, not the action. Crucially the reducers are now
// PURE (`state[x] = payload`); every side effect the old easy-peasy action ran
// inline (IPC broadcast, fs/localStorage write, DOM class, global mutation,
// controller callback, socket emit) moves to settingsSyncMiddleware.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.

/** The slide's background: the theme's own (image or none), its video, or a user image. */
export type ThemeBg = false | { type: 'default' | 'video' | 'custom'; url: string | false };

/** A content line a slide can show (configs/user-settings.json content1..3). */
export type ContentId = string;

/** One field per setting in configs/user-settings.json, camelCased. */
export interface UserSettingsState {
  gurbaniFontSize: number;
  content1FontSize: number;
  content2FontSize: number;
  content3FontSize: number;
  announcementsFontSize: number;
  /** Reset buttons: no value of their own. */
  resetFontSizes: null;
  content1Visibility: boolean;
  content2Visibility: boolean;
  content3Visibility: boolean;
  content1: ContentId;
  content2: ContentId;
  content3: ContentId;
  akhandpatt: boolean;
  displayNextLine: boolean;
  leftAlign: boolean;
  larivaar: boolean;
  larivaarAssist: boolean;
  larivaarAssistType: 'single-color' | 'multi-color';
  displayVishraams: boolean;
  vishraamType: 'colored-words' | 'gradient-bg';
  vishraamSource: 'sttm2' | 'igurbani' | 'sttm';
  slideTransitions: boolean;
  resetPadding: null;
  autoplayToggle: boolean;
  intelligentSpacebar: boolean;
  autoplayDelay: number;
  baniLength: 'short' | 'medium' | 'long' | 'extralong';
  mangalPosition: 'current' | 'above';
  translationLanguage: 'English' | 'Spanish' | 'Hindi';
  translationEnglishSource: 'bdb' | 'ms' | 'ssk';
  translationHindiSource: 'ss' | 'sts';
  teekaSource: 'bdb' | 'ft' | 'ms' | 'ss';
  transliterationLanguage: 'English' | 'Devanagari';
  quickTools: boolean;
  shortcutTray: boolean;
  liveFeed: boolean;
  limitChangeLog: boolean;
  statistics: boolean;
  theme: string;
  themeBg: ThemeBg;
  currentWorkspace: string;
  defaultPaneId: number;
}

/** The setter action for each field: `larivaar` → `setLarivaar(payload)`. */
type SettersOf<S> = {
  [K in keyof S & string as `set${Capitalize<K>}`]: CaseReducer<S, PayloadAction<S[K]>>;
};

/** A setting's entry in configs/user-settings.json (the fields the app reads). */
export interface SettingSchemaEntry {
  title?: string;
  type?: string;
  initialValue?: unknown;
  dontApplyClass?: boolean;
  [field: string]: unknown;
}

/** What settingsSyncMiddleware needs to run a setting's side effects. */
export interface UserSettingActionMeta {
  settingKey: string;
  stateVarName: keyof UserSettingsState;
  schemaEntry: SettingSchemaEntry;
}

const settings = userSettingsConfig.settings as Record<string, SettingSchemaEntry>;

const initialState = {} as Record<string, unknown>;
const reducers: Record<string, CaseReducer<UserSettingsState, PayloadAction<unknown>>> = {};
// action type (`userSettings/setX`) → metadata the middleware needs to run the
// side effects for that setting.
const actionMetaByType: Record<string, UserSettingActionMeta> = {};

Object.keys(settings).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey) as keyof UserSettingsState;
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  initialState[stateVarName] =
    typeof savedSettings[settingKey] === 'undefined'
      ? settings[settingKey].initialValue
      : savedSettings[settingKey];

  reducers[setFuncName] = (state, action) => {
    (state as Record<string, unknown>)[stateVarName] = action.payload;
  };

  actionMetaByType[`userSettings/${setFuncName}`] = {
    settingKey,
    stateVarName,
    schemaEntry: settings[settingKey],
  };
});

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState: initialState as unknown as UserSettingsState,
  reducers: reducers as unknown as SettersOf<UserSettingsState>,
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
export const USER_SETTINGS_INITIAL_STATE = initialState as unknown as UserSettingsState;

// Everything settingsSyncMiddleware needs to reproduce the old inline effects.
export const USER_SETTINGS_SYNC = {
  actionMetaByType,
  savedSettings,
  userConfigPath,
};

export default userSettingsSlice.reducer;
