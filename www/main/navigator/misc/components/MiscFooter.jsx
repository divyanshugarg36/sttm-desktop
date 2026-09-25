import React from 'react';
import { useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { setVerseHistory } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

export const MiscFooter = () => {
  const dispatch = useDispatch();

  const clearHistory = () => {
    dispatch(setVerseHistory([]));
  };

  return (
    <div className="misc-footer">
      <div className="clear-pane">
        <PrimaryButton
          className="clear-history"
          variant="ghost"
          size="sm"
          leftIcon={<Icon name="clock" />}
          onClick={clearHistory}
        >
          {i18n.t(`SHORTCUT_TRAY.CLEAR_HISTORY`)}
        </PrimaryButton>
      </div>
    </div>
  );
};
