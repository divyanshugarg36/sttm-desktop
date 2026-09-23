/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_OVERLAY } from '../../constants';

// Phase 3 of the easy-peasy → Redux Toolkit migration. Mirrors the `app` branch
// that used to live in the easy-peasy GlobalState. Pure state only — the one
// side effect (the inbound `userToken` IPC listener) stays in GlobalState.js but
// now dispatches setUserToken here. See EASY-PEASY-TO-REDUX-MIGRATION.md.
interface AppState {
  overlayScreen: string;
  isListeners: boolean;
  userToken: string;
}

const initialState: AppState = {
  overlayScreen: DEFAULT_OVERLAY,
  isListeners: false,
  userToken: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOverlayScreen: (state, action: PayloadAction<string>) => {
      state.overlayScreen = action.payload;
    },
    setListeners: (state, action: PayloadAction<boolean>) => {
      state.isListeners = action.payload;
    },
    setUserToken: (state, action: PayloadAction<string>) => {
      state.userToken = action.payload;
    },
  },
});

export const { setOverlayScreen, setListeners, setUserToken } = appSlice.actions;

export default appSlice.reducer;
