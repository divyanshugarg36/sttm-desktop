import React from 'react';
import Pane from '../../common/sttm-ui/pane/Pane';
import ViewerContent from './ViewerContent';

type ViewerPaneProps = {
  plain?: boolean;
};

const ViewerPane = React.memo(({ plain = false }: ViewerPaneProps) => (
  <div className="pane-wrapper viewer-pane">
    <Pane header={null} content={ViewerContent} footer={null} plain={plain} />
  </div>
));

ViewerPane.displayName = 'ViewerPane';

export default ViewerPane;
