/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice } from '@reduxjs/toolkit';

// First slice of the easy-peasy → Redux Toolkit migration (proof-of-concept).
// Mirrors the `baniController` branch that used to live in the easy-peasy
// GlobalState. Pure state only — no side effects — so it maps 1:1 to a slice.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.
const initialState = {
  adminPin: null,
  code: null,
  isConnected: false,
};

const baniControllerSlice = createSlice({
  name: 'baniController',
  initialState,
  reducers: {
    setAdminPin: (state, action) => {
      state.adminPin = action.payload;
    },
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setConnection: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setAdminPin, setCode, setConnection } = baniControllerSlice.actions;

export default baniControllerSlice.reducer;
