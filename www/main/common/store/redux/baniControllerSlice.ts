/* eslint-disable no-param-reassign */
// Redux Toolkit uses Immer, so reducers mutate a draft `state` directly.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// First slice of the easy-peasy → Redux Toolkit migration (proof-of-concept).
// Mirrors the `baniController` branch that used to live in the easy-peasy
// GlobalState. Pure state only — no side effects — so it maps 1:1 to a slice.
// See EASY-PEASY-TO-REDUX-MIGRATION.md.
interface BaniControllerState {
  /** Desktop-generated PIN the web controller must send (null when not syncing). */
  adminPin: number | null;
  /** Sync code shown to the operator, e.g. "ABC-XYZ" (null when not syncing). */
  code: string | null;
  isConnected: boolean;
}

const initialState: BaniControllerState = {
  adminPin: null,
  code: null,
  isConnected: false,
};

const baniControllerSlice = createSlice({
  name: 'baniController',
  initialState,
  reducers: {
    setAdminPin: (state, action: PayloadAction<number | null>) => {
      state.adminPin = action.payload;
    },
    setCode: (state, action: PayloadAction<string | null>) => {
      state.code = action.payload;
    },
    setConnection: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setAdminPin, setCode, setConnection } = baniControllerSlice.actions;

export default baniControllerSlice.reducer;
