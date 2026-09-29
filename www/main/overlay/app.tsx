import React from 'react';

import { Provider } from 'react-redux';

import OverlayLayout from './components/OverlayLayout';
import overlayStore from './store/overlay-store';

const App = () => (
  <Provider store={overlayStore}>
    <OverlayLayout />
  </Provider>
);

export default App;
