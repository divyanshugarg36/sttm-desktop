import React from 'react';

import { Overlay } from '../../../common/sttm-ui';
import { i18n } from '../../../common/main-app';

type LockScreenProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
};

const LockScreen = ({ onScreenClose }: LockScreenProps) => (
  <Overlay onScreenClose={onScreenClose}>
    <div className="lock-screen-message"> {i18n.t('TOOLBAR.LOCKED_SCREEN')} </div>
  </Overlay>
);

export default LockScreen;
