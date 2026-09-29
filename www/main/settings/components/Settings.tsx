import React from 'react';

import { Overlay } from '../../common/sttm-ui';

import SettingsNav from './SettingsNav';
import SettingsContainer from './SettingsContainer';
import ThemeContainer from './ThemeContainer';
import SettingViewer from './SettingViewer';
import { settingsNavObj, settingsObj } from '../utils';

type SettingsProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
};

const Settings = ({ onScreenClose }: SettingsProps) => (
  <Overlay onScreenClose={onScreenClose}>
    <div className="addon-wrapper settings-wrapper">
      <div className="main-settings-wrapper">
        <SettingsNav settingsNavObj={settingsNavObj} />
        <div className="settings-categories">
          <SettingsContainer settingsObj={settingsObj} />
        </div>
      </div>
      <div className="other-settings">
        <SettingViewer />
        <ThemeContainer />
      </div>
    </div>
  </Overlay>
);

export default Settings;
