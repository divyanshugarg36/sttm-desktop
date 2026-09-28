import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Pane from '../../common/sttm-ui/pane/Pane';
import { classNames } from '../../common/utils';
import ShabadHeader from './ShabadHeader';
import MultiPaneHeader from './MultiPaneHeader';
import MultiPaneContent from './MultiPaneContent';

const ShabadPane = ({ className = '', multiPaneId = false, plain = false, footer = null }) => {
  const { activePaneId } = useSelector((state) => state.navigator);
  const { defaultPaneId } = useSelector((state) => state.userSettings);
  return (
    <div
      className={classNames(
        'pane-wrapper shabad-pane',
        plain && 'shabad-pane--shared-box',
        className,
      )}
    >
      <Pane
        header={multiPaneId ? MultiPaneHeader : ShabadHeader}
        content={MultiPaneContent}
        footer={footer}
        data={{ multiPaneId: multiPaneId || defaultPaneId }}
        className={multiPaneId === activePaneId ? 'pane--live' : 'pane--inactive'}
        plain={plain}
      />
    </div>
  );
};

ShabadPane.propTypes = {
  className: PropTypes.string,
  multiPaneId: PropTypes.number,
  plain: PropTypes.bool,
  footer: PropTypes.elementType,
};
export default ShabadPane;
