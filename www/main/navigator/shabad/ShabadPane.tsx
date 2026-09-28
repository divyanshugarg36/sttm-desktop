import React from 'react';

import Pane, { type PaneSlotProps } from '../../common/sttm-ui/pane/Pane';
import { useAppSelector } from '../../common/store/redux/hooks';
import { classNames } from '../../common/utils';
import ShabadHeader from './ShabadHeader';
import MultiPaneHeader from './MultiPaneHeader';
import MultiPaneContent from './MultiPaneContent';

type ShabadPaneProps = {
  className?: string;
  /** The Multi-Pane pane it shows; false for the single shabad pane. */
  multiPaneId?: number | false;
  plain?: boolean;
  footer?: React.ComponentType<PaneSlotProps> | null;
};

const ShabadPane = ({
  className = '',
  multiPaneId = false,
  plain = false,
  footer = null,
}: ShabadPaneProps) => {
  const { activePaneId } = useAppSelector((state) => state.navigator);
  const { defaultPaneId } = useAppSelector((state) => state.userSettings);
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
export default ShabadPane;
