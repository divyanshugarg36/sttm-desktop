/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Phase 5 of the easy-peasy → Redux migration: the viewer window's
// `viewerSettings` branch (was ViewerState.viewerSettings). Pure reducers —
// `quickToolsOpen`/`paddingToolsOpen` are viewer-local UI state (each closes the
// other), and `containerPadding` is kept in sync from the main window via the
// `update-viewer-setting` IPC listener in the viewer store.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.
/** The viewer's padding on each side, in pixels. */
export interface ContainerPadding {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ViewerSettingsState {
  containerPadding: ContainerPadding;
  quickToolsOpen: boolean;
  paddingToolsOpen: boolean;
}

const initialState: ViewerSettingsState = {
  containerPadding: {
    left: 48,
    top: 20,
    right: 0,
    bottom: 0,
  },
  quickToolsOpen: false,
  paddingToolsOpen: false,
};

const viewerSettingsSlice = createSlice({
  name: 'viewerSettings',
  initialState,
  reducers: {
    // Opening quick tools closes padding tools, and vice-versa.
    setQuickToolsOpen: (state, action: PayloadAction<boolean>) => {
      state.paddingToolsOpen = false;
      state.quickToolsOpen = action.payload;
    },
    setPaddingToolsOpen: (state, action: PayloadAction<boolean>) => {
      state.quickToolsOpen = false;
      state.paddingToolsOpen = action.payload;
    },
    setPadding: (state, action: PayloadAction<{ type: keyof ContainerPadding; value: number }>) => {
      state.containerPadding[action.payload.type] = action.payload.value;
    },
  },
});

export const viewerSettingsActions = viewerSettingsSlice.actions;
export const { setQuickToolsOpen, setPaddingToolsOpen, setPadding } = viewerSettingsSlice.actions;

export default viewerSettingsSlice.reducer;
