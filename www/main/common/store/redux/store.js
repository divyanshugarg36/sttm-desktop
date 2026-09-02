import { configureStore } from '@reduxjs/toolkit';

import appReducer from './appSlice';
import baniControllerReducer from './baniControllerSlice';

// Redux store for the main app window. During the easy-peasy → Redux migration
// this runs ALONGSIDE the easy-peasy GlobalState (coexistence): slices are
// moved over one at a time, and each migrated branch is removed from
// GlobalState so there's a single source of truth per branch.
// baniController is the first slice. See EASY-PEASY-TO-REDUX-MIGRATION.md.
const store = configureStore({
  reducer: {
    app: appReducer,
    baniController: baniControllerReducer,
  },
});

export default store;
