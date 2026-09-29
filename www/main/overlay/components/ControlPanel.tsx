import React from 'react';

import { CopyToClipboard } from './CopyToClipboard';
import OverlaySettings from './Options';
import { settingsObj } from '../utils/parse-overlay-options';

type ControlPanelProps = {
  url: string;
};

export const ControlPanel = ({ url }: ControlPanelProps) => (
  <section className="control-panel">
    <OverlaySettings settingsObj={settingsObj} />
    <CopyToClipboard url={url} />
  </section>
);
