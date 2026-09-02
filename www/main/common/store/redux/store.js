import { configureStore } from '@reduxjs/toolkit';

import appReducer from './appSlice';
import baniControllerReducer from './baniControllerSlice';
import userSettingsReducer from './userSettingsSlice';
import settingsSyncMiddleware from './settingsSyncMiddleware';

// Redux store for the main app window. During the easy-peasy → Redux migration
// this runs ALONGSIDE the easy-peasy GlobalState (coexistence): slices are
// moved over one at a time, and each migrated branch is removed from
// GlobalState so there's a single source of truth per branch.
// baniController is the first slice. See EASY-PEASY-TO-REDUX-MIGRATION.md.
const store = configureStore({
  reducer: {
    app: appReducer,
    baniController: baniControllerReducer,
    userSettings: userSettingsReducer,
  },
  // The settings actions used to run their side effects (IPC/fs/DOM/socket)
  // inside the reducer; those now live in this middleware. Settings payloads can
  // include non-serializable-ish values in dev checks, so scope the check out
  // for the settings actions to avoid noise.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(settingsSyncMiddleware),
});

export default store;
