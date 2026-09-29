import React from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import { Icon, Overlay } from '../../../common/sttm-ui';
import { i18n } from '../../../common/main-app';

type LockScreenProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
};

// Shown while a Bani Controller has locked the app: a card in the middle of
// the backdrop.
const LockScreen = ({ onScreenClose }: LockScreenProps) => (
  <Overlay onScreenClose={onScreenClose}>
    <div className="lock-screen">
      <Box variant="gradient" className="lock-screen__card">
        <Icon name="lock" className="lock-screen__icon" />
        <p className="lock-screen__message">{i18n.t('TOOLBAR.LOCKED_SCREEN')}</p>
      </Box>
    </div>
  </Overlay>
);

export default LockScreen;
