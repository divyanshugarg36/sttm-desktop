import React from 'react';
import { StoreProvider } from 'easy-peasy';
import { Provider } from 'react-redux';

import GlobalState from './common/store/GlobalState';
import store from './common/store/redux/store';
import Launchpad from './launchpad';
import { globalInit } from './common/constants';

// Initialize globals
globalInit.socket();

// Coexistence during the easy-peasy → Redux migration: the Redux Provider wraps
// the easy-peasy StoreProvider so migrated slices (baniController first) and
// not-yet-migrated branches both resolve. See EASY-PEASY-TO-REDUX-MIGRATION.md.
const App = () => (
  <Provider store={store}>
    <StoreProvider store={GlobalState}>
      <Launchpad />
    </StoreProvider>
  </Provider>
);

export default App;
