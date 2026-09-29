import React from 'react';

import OverlaySettingsContainer from './OverlaySettingsContainer';
import type { GeneratedCategory } from '../../common/utils/settings-obj-generator';

type OverlaySettingsProps = {
  settingsObj: Record<string, GeneratedCategory>;
};

const OverlaySettings = ({ settingsObj }: OverlaySettingsProps) => (
  <div className="overlay-settings-wrapper">
    <OverlaySettingsContainer settingsObj={settingsObj} />
  </div>
);

export default OverlaySettings;
