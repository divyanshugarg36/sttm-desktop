/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice } from '@reduxjs/toolkit';

import { DEFAULT_OVERLAY } from '../../constants';

// Phase 3 of the easy-peasy → Redux Toolkit migration. Mirrors the `app` branch
// that used to live in the easy-peasy GlobalState. Pure state only — the one
// side effect (the inbound `userToken` IPC listener) stays in GlobalState.js but
// now dispatches setUserToken here. See EASY-PEASY-TO-REDUX-MIGRATION.md.
const initialState = {
  overlayScreen: DEFAULT_OVERLAY,
  isListeners: false,
  userToken: '',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOverlayScreen: (state, action) => {
      state.overlayScreen = action.payload;
    },
    setListeners: (state, action) => {
      state.isListeners = action.payload;
    },
    setUserToken: (state, action) => {
      state.userToken = action.payload;
    },
  },
});

export const { setOverlayScreen, setListeners, setUserToken } = appSlice.actions;

export default appSlice.reducer;
