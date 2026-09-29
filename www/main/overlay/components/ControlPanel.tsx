import React from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import { CopyToClipboard } from './CopyToClipboard';
import OverlaySettings from './Options';
import { settingsObj } from '../utils/parse-overlay-options';

type ControlPanelProps = {
  url: string;
};

// The overlay's settings as titled groups of setting rows, then its live URL.
export const ControlPanel = ({ url }: ControlPanelProps) => (
  <Box variant="gradient" className="control-panel">
    <OverlaySettings settingsObj={settingsObj} />
    <CopyToClipboard url={url} />
  </Box>
);
