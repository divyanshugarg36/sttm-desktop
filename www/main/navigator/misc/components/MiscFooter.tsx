import React from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { setVerseHistory } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';
import { classNames } from '../../../common/utils';
import { i18n } from '../../../common/main-app';
import { useAppDispatch } from '../../../common/store/redux/hooks';
import type { PaneSlotProps } from '../../../common/sttm-ui/pane/Pane';

export const MiscFooter = ({ className }: PaneSlotProps) => {
  const dispatch = useAppDispatch();

  const clearHistory = () => {
    dispatch(setVerseHistory([]));
  };

  return (
    <div className={classNames(className, 'misc-pane__footer')}>
      <div className="misc-pane__actions">
        <PrimaryButton
          className="misc-pane__clear-history"
          size="xs"
          shape="rounded-md"
          leftIcon={<Icon name="clock" />}
          onClick={clearHistory}
        >
          {i18n.t(`SHORTCUT_TRAY.CLEAR_HISTORY`)}
        </PrimaryButton>
      </div>
    </div>
  );
};
