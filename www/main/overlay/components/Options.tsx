import React from 'react';

import OverlaySettingsContainer from './OverlaySettingsContainer';
import type { GeneratedCategory } from '../../common/utils/settings-obj-generator';

type OverlaySettingsProps = {
  settingsObj: Record<string, GeneratedCategory>;
  isToolbar?: boolean;
};

const OverlaySettings = ({ settingsObj, isToolbar = false }: OverlaySettingsProps) => (
  <div className={isToolbar ? 'overlay-toolbar' : 'overlay-settings'}>
    <OverlaySettingsContainer settingsObj={settingsObj} isToolbar={isToolbar} />
  </div>
);

export default OverlaySettings;
