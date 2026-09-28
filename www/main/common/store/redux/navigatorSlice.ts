/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type CaseReducer, type PayloadAction } from '@reduxjs/toolkit';

import { convertToCamelCase } from '../../utils';
import navigatorSettings from '../../../../configs/navigator-settings.json';
import type { BaniOptionGroup } from '../../../banidb/constants';
import type { LegacyVerse, RealmRow } from '../../../banidb/sqlite-search';

// Phase 4 of the easy-peasy → Redux migration: the `navigator` branch.
//
// Replaces createNavigatorSettingsState. Reducers are generated from the same
// config JSON (action names unchanged: `setActiveShabadId`, …) and are PURE.
// The old easy-peasy action's one side effect — broadcasting the change to the
// viewer window over `update-viewer-setting` — moves to settingsSyncMiddleware.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.

/** A shabad, bani or ceremony in the History list (saveToHistory). */
export interface HistoryEntry {
  shabadId: number;
  verseId: number;
  label: string;
  type: string;
  meta: { baniLength?: string };
  versesRead: number[];
  continueFrom: number;
  homeVerse: number;
}

/** A Multi-Pane pane: what it shows and where its reader is. */
export interface PaneState {
  locked: boolean;
  activeShabad: number | null;
  activeVerse: number | '';
  versesRead: number[];
  homeVerse: number | false;
  content: string;
  baniType: string;
}

/** A shabad saved to the user's favourites (the SikhiToTheMax API). */
export interface FavouriteShabad {
  id?: number;
  shabadId: number;
  verseId: number;
  [field: string]: unknown;
}

/** Keyboard shortcuts waiting to be handled (set by the shortcut, cleared by its handler). */
export interface ShortcutFlags {
  openWaheguruSlide: boolean;
  openMoolMantraSlide: boolean;
  openBlankViewer: boolean;
  openAnandSahibBhog: boolean;
  focusInput: boolean;
  nextVerse: boolean;
  prevVerse: boolean;
  homeVerse: boolean;
  openFirstResult: boolean;
  openDhanGuruSlide: boolean;
  copyToClipboard: boolean;
  nextShabad: boolean;
  prevShabad: boolean;
}

/** One field per key in configs/navigator-settings.json. */
export interface NavigatorState {
  currentSearchType: number;
  searchQuery: string;
  initialVerseId: number | null;
  verseHistory: HistoryEntry[];
  versesRead: number[];
  searchData: RealmRow<LegacyVerse>[];
  homeVerse: number | false | null;
  currentLanguage: string;
  currentSource: string;
  currentRaag: string | number;
  currentWriter: string | number;
  activeShabadId: number | string | null;
  activeVerseId: number | '';
  searchShabadsCount: number;
  savedCrossPlatformId: number | null;
  historyOrder: 'newest' | 'oldest';
  lineNumber: number | null;
  isMiscSlide: boolean;
  miscSlideText: string;
  isMiscSlideGurmukhi: boolean;
  isAnnouncement: boolean;
  isRandomShabad: boolean;
  isSundarGutkaBani: boolean;
  sundarGutkaBaniId: number | null;
  ceremonyId: number | null;
  isCeremonyBani: boolean;
  singleDisplayActiveTab: string;
  shortcuts: ShortcutFlags;
  minimizedBySingleDisplay: boolean;
  isDontSaveHistory: boolean;
  favShabad: FavouriteShabad[];
  searchVerse: string;
  currentMiscPanel: string;
  activePaneId: number | null;
  pane1: PaneState;
  pane2: PaneState;
  pane3: PaneState;
  disabledContent: string[];
  filteredBaniOptions: BaniOptionGroup[];
}

/** The setter action for each field: `searchQuery` → `setSearchQuery(payload)`. */
type SettersOf<S> = {
  [K in keyof S & string as `set${Capitalize<K>}`]: CaseReducer<S, PayloadAction<S[K]>>;
};

const initialState = {} as Record<string, unknown>;
const reducers: Record<string, CaseReducer<NavigatorState, PayloadAction<unknown>>> = {};
// action type (`navigator/setX`) → metadata the middleware needs to broadcast.
const actionMetaByType: Record<string, { stateVarName: keyof NavigatorState }> = {};

Object.keys(navigatorSettings).forEach((settingKey) => {
  const stateVarName = convertToCamelCase(settingKey) as keyof NavigatorState;
  const setFuncName = `set${convertToCamelCase(settingKey, true)}`;

  // navigator's config maps key → initial value directly.
  initialState[stateVarName] = navigatorSettings[settingKey as keyof typeof navigatorSettings];

  reducers[setFuncName] = (state, action) => {
    (state as Record<string, unknown>)[stateVarName] = action.payload;
  };

  actionMetaByType[`navigator/${setFuncName}`] = { stateVarName };
});

const navigatorSlice = createSlice({
  name: 'navigator',
  initialState: initialState as unknown as NavigatorState,
  reducers: reducers as unknown as SettersOf<NavigatorState>,
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
export const NAVIGATOR_INITIAL_STATE = initialState as unknown as NavigatorState;

// What settingsSyncMiddleware needs to broadcast navigator changes to the viewer.
export const NAVIGATOR_SYNC = { actionMetaByType };

export default navigatorSlice.reducer;
