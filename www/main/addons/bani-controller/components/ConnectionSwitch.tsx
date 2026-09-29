import React from 'react';
import { Switch } from '../../../common/sttm-ui';
import { analytics } from '../../../common/main-app';

type ConnectionSwitchProps = {
  isConnected: boolean;
  syncToggle: () => void;
};

const ConnectionSwitch = ({ isConnected, syncToggle }: ConnectionSwitchProps) => (
  <div className="connection-switch-container">
    <p>Disable all the remote connections to SikhiToTheMax</p>
    <Switch
      controlId="bani-controller"
      onToggle={() => {
        syncToggle();
        analytics.trackEvent({
          category: 'controller',
          action: 'connection',
          label: isConnected ? 'Enabled' : 'Disabled',
        });
      }}
      value={!isConnected}
    />
  </div>
);

export default ConnectionSwitch;
