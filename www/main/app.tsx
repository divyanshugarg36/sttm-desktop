import React from 'react';
import { Provider } from 'react-redux';
import { ToastHost } from '@khalisfoundation/sikhi-ui';

import store from './common/store/redux/store';
import Launchpad from './launchpad';
import { globalInit } from './common/constants';

// Initialize globals
globalInit.socket();

// easy-peasy has been fully removed — the main window runs on a single Redux
// store. See EASY-PEASY-TO-REDUX-MIGRATION.md. ToastHost shows the messages
// sikhi-ui's `toast` sends from anywhere in the window (loaders, utilities).
const App = () => (
  <Provider store={store}>
    <Launchpad />
    <ToastHost />
  </Provider>
);

export default App;
