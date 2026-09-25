import React, { useState } from 'react';
import { shell } from 'electron';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { ZOOM_LINK } from '../../../common/constants';

const remote = require('@electron/remote');

const { store, i18n } = remote.require('./app');

const ZoomController = () => {
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [apiCode, setApiCode] = useState('');

  const handleApiInputChange = (event) => {
    if (event.target.value) {
      setShowSaveBtn(true);
      setApiCode(event.target.value);
    } else {
      setApiCode('');
    }
  };

  const saveApiCode = () => {
    if (apiCode) {
      store.set('userPrefs.app.zoomToken', apiCode);
      setShowSaveBtn(false);
    }
  };

  const clearApiCode = () => {
    setApiCode('');
    store.set('userPrefs.app.zoomToken', apiCode);
    setShowSaveBtn(true);
  };

  const openBrowser = () => {
    shell.openExternal(ZOOM_LINK);
  };

  return (
    <div className="zoom-dialogue overlay-ui ui-sync-button">
      <img className="zoom-logo" src="assets/img/icons/zoom.svg" />
      <header className="sync-header">{i18n.t('TOOLBAR.ZOOM_HEADING')}</header>
      <div className="zoom-content-wrapper">
        <div className="zoom-content">
          <div className="zoom-code-label"> {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INPUT_HELPER')} </div>
          <div className="zoom-form">
            <input
              className="zoom-api-input"
              type="text"
              value={apiCode}
              onChange={handleApiInputChange}
            />
            {showSaveBtn ? (
              <PrimaryButton className="save-btn" size="sm" onClick={saveApiCode}>
                {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.SAVE_BUTTON')}
              </PrimaryButton>
            ) : (
              <PrimaryButton className="clear-btn" variant="outline" size="sm" onClick={clearApiCode}>
                {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.CLEAR_BUTTON')}
              </PrimaryButton>
            )}
          </div>

          <PrimaryButton
            className="instructions-btn"
            variant="ghost"
            size="sm"
            leftIcon={<img className="play-icon" src="assets/img/icons/play-button.svg" />}
            onClick={openBrowser}
          >
            {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS_BUTTON')}
          </PrimaryButton>

          <div className="quick-container">
            <div className="quick-title">
              {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS_HEADING')}
            </div>
            <ol className="quick-steps">
              <li>{i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS.0')}</li>
              <li>{i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS.1')}</li>
              <li>{i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS.2')}</li>
              <li>{i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS.3')}</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomController;
