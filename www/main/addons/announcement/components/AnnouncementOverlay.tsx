import React, { useState } from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import { Overlay, Switch } from '../../../common/sttm-ui';
import Announcement from './Announcement';
import { DhanGuru } from './DhanGuru';
import MiscSlides from './MiscSlides';
import { useAppSelector } from '../../../common/store/redux/hooks';

type AnnouncementPaneProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
  className?: string;
};

const AnnouncementPane = ({ onScreenClose, className }: AnnouncementPaneProps) => {
  const { isMiscSlideGurmukhi } = useAppSelector((state) => state.navigator);

  const [isGurmukhi, setIsGurmukhi] = useState(isMiscSlideGurmukhi);

  const changeGurmukhiLanguage = (value: boolean) => {
    if (isGurmukhi !== value) {
      setIsGurmukhi(value);
    }
  };

  return (
    <Overlay onScreenClose={onScreenClose} className={className}>
      <Box variant="gradient" className="addon-overlay">
        <header>
          <h2>Announcement</h2>
          <Switch
            title="Gurmukhi"
            controlId="gurmukhi-switch"
            className="gurmukhi-switch"
            value={isMiscSlideGurmukhi}
            onToggle={changeGurmukhiLanguage}
          />
        </header>
        <Announcement isGurmukhi={isGurmukhi} />
        <MiscSlides />
        <DhanGuru isGurmukhi={isGurmukhi} />
      </Box>
    </Overlay>
  );
};

export default AnnouncementPane;
