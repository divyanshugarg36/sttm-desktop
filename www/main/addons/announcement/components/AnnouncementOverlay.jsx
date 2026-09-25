import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Box } from '@khalisfoundation/sikhi-ui';

import { Overlay, Switch } from '../../../common/sttm-ui';
import Announcement from './Announcement';
import { DhanGuru } from './DhanGuru';
import MiscSlides from './MiscSlides';

const AnnouncementPane = ({ onScreenClose, className }) => {
  const { isMiscSlideGurmukhi } = useSelector((state) => state.navigator);

  const [isGurmukhi, setIsGurmukhi] = useState(isMiscSlideGurmukhi);

  const changeGurmukhiLanguage = (value) => {
    if (isGurmukhi !== value) {
      setIsGurmukhi(value);
    }
  };

  return (
    <Overlay onScreenClose={onScreenClose} className={className}>
      <Box variant="blur" className="addon-overlay">
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

AnnouncementPane.propTypes = {
  onScreenClose: PropTypes.func,
  className: PropTypes.string,
};

export default AnnouncementPane;
