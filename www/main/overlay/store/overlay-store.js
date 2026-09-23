import { configureStore } from '@reduxjs/toolkit';

import baniOverlayReducer from '../../common/store/redux/baniOverlaySlice';
import platform from '../../desktop_scripts';

// Redux store for the overlay window (replaces the easy-peasy OverlayState). It
// reuses the shared baniOverlay slice — its initial state (BANI_OVERLAY_INITIAL_STATE)
// comes from the saved overlay settings the slice loads. The overlay window is
// NOT the source of truth: every local change is broadcast to the main window
// over `update-global-setting`, which persists it and mirrors it back. The
// broadcast is the only side effect, so it lives in this store's own middleware
// (the slice reducers stay pure). See EASY-PEASY-TO-REDUX-MIGRATION.md.

global.platform = platform;

// On any baniOverlay/set* action, tell the main window to apply + persist it.
const broadcastToMain = () => (next) => (action) => {
  const result = next(action);
  if (typeof action.type === 'string' && action.type.startsWith('baniOverlay/')) {
    global.platform.ipc.send(
      'update-global-setting',
      JSON.stringify({
        actionName: action.type.slice('baniOverlay/'.length),
        payload: action.payload,
        settingType: 'baniOverlay',
      }),
    );
  }
  return result;
};

const overlayStore = configureStore({
  reducer: {
    baniOverlay: baniOverlayReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(broadcastToMain),
});

export default overlayStore;
