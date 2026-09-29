import React, { useState } from 'react';
import { shell } from 'electron';
import { Box, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { ZOOM_LINK } from '../../../common/constants';
import { i18n, store } from '../../../common/main-app';

const ZoomController = () => {
  const [showSaveBtn, setShowSaveBtn] = useState(false);
  const [apiCode, setApiCode] = useState('');

  const handleApiInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // A card like the Sync card: the API token as a setting row, then the quick
  // guide as a titled group.
  return (
    <Box variant="gradient" className="sync-card zoom-card">
      <h3 className="sync-card__title">
        <img className="zoom-card__logo" src="assets/img/icons/zoom-blue.svg" alt="" />
        {i18n.t('TOOLBAR.ZOOM_HEADING')}
      </h3>
      <div className="setting-row sync-row">
        <div className="setting-row__label">
          <span className="setting-row__note">
            {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INPUT_HELPER')}
          </span>
        </div>
        <div className="setting-row__control">
          <input
            className="sync-input"
            type="text"
            value={apiCode}
            onChange={handleApiInputChange}
          />
          {showSaveBtn ? (
            <PrimaryButton size="sm" onClick={saveApiCode}>
              {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.SAVE_BUTTON')}
            </PrimaryButton>
          ) : (
            <PrimaryButton variant="outline" size="sm" onClick={clearApiCode}>
              {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.CLEAR_BUTTON')}
            </PrimaryButton>
          )}
        </div>
      </div>

      <section className="settings-group">
        <h4 className="settings-group__title">
          {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS_HEADING')}
        </h4>
        <ol className="zoom-card__steps">
          {[0, 1, 2, 3].map((step) => (
            <li key={step}>{i18n.t(`TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS.${step}`)}</li>
          ))}
        </ol>
        <div className="zoom-card__actions">
          <PrimaryButton
            variant="outline"
            size="sm"
            leftIcon={
              <img className="zoom-card__play" src="assets/img/icons/play-button.svg" alt="" />
            }
            onClick={openBrowser}
          >
            {i18n.t('TOOLBAR.ZOOM_CC_OVERLAY.INSTRUCTIONS_BUTTON')}
          </PrimaryButton>
        </div>
      </section>
    </Box>
  );
};

export default ZoomController;
