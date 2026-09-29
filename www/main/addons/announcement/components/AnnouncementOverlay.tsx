import React, { useState } from 'react';
import { Box, Toggle } from '@khalisfoundation/sikhi-ui';

import { Overlay } from '../../../common/sttm-ui';
import Announcement from './Announcement';
import { DhanGuru } from './DhanGuru';
import MiscSlides from './MiscSlides';
import { useAppSelector } from '../../../common/store/redux/hooks';
import { i18n } from '../../../common/main-app';

type AnnouncementPaneProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
  className?: string;
};

// Laid out like Settings: titled groups on a gradient Box, the language as a
// setting row.
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
        <section className="settings-group">
          <h4 className="settings-group__title">{i18n.t('INSERT.ANNOUNCEMENT')}</h4>
          <div className="setting-row">
            <div className="setting-row__label">
              <span className="setting-row__title">
                {i18n.t('INSERT.ANNOUNCEMENT_IN_GURMUKHI')}
              </span>
            </div>
            <div className="setting-row__control">
              <Toggle
                id="gurmukhi-switch"
                size="lg"
                checked={isGurmukhi}
                onChange={(event) => changeGurmukhiLanguage(event.target.checked)}
              />
            </div>
          </div>
          <Announcement isGurmukhi={isGurmukhi} />
        </section>
        <MiscSlides />
        <DhanGuru isGurmukhi={isGurmukhi} />
      </Box>
    </Overlay>
  );
};

export default AnnouncementPane;
