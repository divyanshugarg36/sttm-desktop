import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import classNames from '../../common/utils/classnames';
import { Icon } from '../../common/sttm-ui';
import FavShabadIcon from './FavShabadIcon';
import ArrowIcon from './ArrowIcon';

const electron = require('electron');

const { ipcRenderer } = electron;
const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const ShabadHeader = () => {
  const [showViewer, setShowViewer] = useState(true);
  const { defaultPaneId } = useSelector((state) => state.userSettings);

  useEffect(() => {
    ipcRenderer.send('toggle-viewer-window', showViewer);
  }, [showViewer]);

  return (
    <div className="shabad-pane-header">
      <PrimaryButton
        className={classNames('toggle-viewer-btn', !showViewer && 'btn-danger')}
        variant={showViewer ? 'default' : 'destructive'}
        size="xs"
        shape="rounded-md"
        leftIcon={<Icon name={showViewer ? 'eye-off' : 'eye'} />}
        onClick={() => setShowViewer(!showViewer)}
        title={showViewer ? i18n.t('SHABAD_PANE.HIDE_BUTTON_TOOLTIP') : ''}
      >
        {showViewer ? i18n.t('SHABAD_PANE.HIDE_SCREEN') : i18n.t('SHABAD_PANE.SHOW_DISPLAY')}
      </PrimaryButton>
      <FavShabadIcon />
      <ArrowIcon paneId={defaultPaneId} />
    </div>
  );
};

export default ShabadHeader;
