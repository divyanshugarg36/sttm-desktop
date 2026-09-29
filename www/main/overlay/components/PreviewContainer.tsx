import React from 'react';

import OverlaySettings from './Options';

import { bottomSettings } from '../utils/parse-overlay-options';

type PreviewContainerProps = {
  url: string;
};

// The live preview, with the logo / green screen, layout and reset controls
// under it.
export const PreviewContainer = ({ url }: PreviewContainerProps) => (
  <section className="preview-container">
    <webview className="preview" src={url}></webview>
    <OverlaySettings settingsObj={bottomSettings} isToolbar />
  </section>
);
