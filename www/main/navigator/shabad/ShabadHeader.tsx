import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import classNames from '../../common/utils/classnames';
import { Icon } from '../../common/sttm-ui';
import FavShabadIcon from './FavShabadIcon';
import ArrowIcon from './ArrowIcon';
import { sendToMain } from '../../common/ipc';
import { i18n } from '../../common/main-app';
import { useAppSelector } from '../../common/store/redux/hooks';

type ShabadHeaderProps = {
  className?: string;
};

const ShabadHeader = ({ className }: ShabadHeaderProps) => {
  const [showViewer, setShowViewer] = useState(true);
  const { defaultPaneId } = useAppSelector((state) => state.userSettings);

  useEffect(() => {
    sendToMain('toggle-viewer-window', showViewer);
  }, [showViewer]);

  return (
    <div className={classNames(className, 'shabad-pane__header')}>
      <PrimaryButton
        className={classNames(
          'shabad-pane__toggle-viewer',
          !showViewer && 'shabad-pane__toggle-viewer--off',
        )}
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
