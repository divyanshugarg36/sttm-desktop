import React from 'react';
import PropTypes from 'prop-types';
import Pane from '../../common/sttm-ui/pane/Pane';
import ViewerContent from './ViewerContent';

const ViewerPane = React.memo(({ plain = false }) => (
  <div className="pane-container viewer-pane">
    <Pane header={null} content={ViewerContent} footer={null} plain={plain} />
  </div>
));

ViewerPane.displayName = 'ViewerPane';

ViewerPane.propTypes = {
  plain: PropTypes.bool,
};

export default ViewerPane;
