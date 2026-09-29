import React from 'react';

import OverlaySettings from './Options';

import { bottomSettings } from '../utils/parse-overlay-options';

type PreviewContainerProps = {
  url: string;
};

export const PreviewContainer = ({ url }: PreviewContainerProps) => (
  <section className="preview-container">
    <webview className="preview" src={url}></webview>
    <section className="bottom-settings">
      <OverlaySettings settingsObj={bottomSettings} />
    </section>
  </section>
);
