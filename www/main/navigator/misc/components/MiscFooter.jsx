import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { setVerseHistory } from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';
import { classNames } from '../../../common/utils';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

export const MiscFooter = ({ className }) => {
  const dispatch = useDispatch();

  const clearHistory = () => {
    dispatch(setVerseHistory([]));
  };

  return (
    <div className={classNames(className, 'misc-footer')}>
      <div className="clear-pane">
        <PrimaryButton
          className="clear-history"
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

MiscFooter.propTypes = {
  className: PropTypes.string,
};
