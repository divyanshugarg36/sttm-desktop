import React from 'react';
import { Toggle } from '@khalisfoundation/sikhi-ui';
import { analytics, i18n } from '../../../common/main-app';

type ConnectionSwitchProps = {
  isConnected: boolean;
  syncToggle: () => void;
};

// A setting row: turn every remote connection off.
const ConnectionSwitch = ({ isConnected, syncToggle }: ConnectionSwitchProps) => (
  <div className="setting-row">
    <div className="setting-row__label">
      <span className="setting-row__title">
        {i18n.t('TOOLBAR.DISABLE_CONNECTIONS_MSG', { appName: i18n.t('APPNAME') })}
      </span>
    </div>
    <div className="setting-row__control">
      <Toggle
        id="bani-controller"
        size="lg"
        checked={!isConnected}
        onChange={() => {
          syncToggle();
          analytics.trackEvent({
            category: 'controller',
            action: 'connection',
            label: isConnected ? 'Enabled' : 'Disabled',
          });
        }}
      />
    </div>
  </div>
);

export default ConnectionSwitch;
