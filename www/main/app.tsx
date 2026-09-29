import React from 'react';
import { Provider } from 'react-redux';
import { ToastHost } from '@khalisfoundation/sikhi-ui';

import store from './common/store/redux/store';
import Launchpad from './launchpad';
import { AppDialogHost } from './common/sttm-ui';
import { globalInit } from './common/constants';

// Initialize globals
globalInit.socket();

// easy-peasy has been fully removed — the main window runs on a single Redux
// store. See EASY-PEASY-TO-REDUX-MIGRATION.md. ToastHost and AppDialogHost show
// the toasts and dialogs sent from anywhere in the window (loaders, utilities).
const App = () => (
  <Provider store={store}>
    <Launchpad />
    <ToastHost />
    <AppDialogHost />
  </Provider>
);

export default App;
