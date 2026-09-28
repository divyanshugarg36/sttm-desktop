import React, { useEffect, useRef } from 'react';
import type { WebviewTag } from 'electron';
import { sendToMain } from '../../common/ipc';
import { classNames } from '../../common/utils';
import type { PaneSlotProps } from '../../common/sttm-ui/pane/Pane';

const ViewerContent = ({ className }: PaneSlotProps) => {
  const webviewRef = useRef<WebviewTag>(null);

  useEffect(() => {
    const handleDomReady = () => {
      sendToMain('enable-wc-webview', webviewRef.current!.getWebContentsId());
      global.webview = webviewRef.current;
      global.webview!.send('update-settings');
    };

    const webviewElement = webviewRef.current;
    if (webviewElement) {
      webviewElement.addEventListener('dom-ready', handleDomReady);
    }

    return () => {
      if (webviewElement) {
        webviewElement.removeEventListener('dom-ready', handleDomReady);
        global.webview = null;
      }
    };
  }, []);

  return (
    <div className={classNames(className, 'viewer-pane__content')}>
      <webview
        src="viewer.html"
        className="viewer-pane__webview"
        id="webview-viewer"
        ref={webviewRef}
        /* eslint-disable react/no-unknown-property */
        // @ts-expect-error React types it as a boolean; Electron reads the attribute's value.
        nodeintegration="true"
        nodeintegrationinsubframes="true"
        webpreferences="contextIsolation=no"
      />
    </div>
  );
};

export default ViewerContent;
