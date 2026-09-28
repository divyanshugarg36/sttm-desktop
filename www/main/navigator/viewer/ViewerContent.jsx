import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import { classNames } from '../../common/utils';

const ViewerContent = ({ className }) => {
  const webviewRef = useRef(null);

  useEffect(() => {
    const handleDomReady = () => {
      ipcRenderer.send('enable-wc-webview', webviewRef.current.getWebContentsId());
      global.webview = webviewRef.current;
      global.webview.send('update-settings');
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
        nodeintegration="true"
        nodeintegrationinsubframes="true"
        webpreferences="contextIsolation=no"
      />
    </div>
  );
};

ViewerContent.propTypes = {
  className: PropTypes.string,
};

export default ViewerContent;
