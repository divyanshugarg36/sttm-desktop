import React from 'react';
import PropTypes from 'prop-types';
import PaneContent from './PaneContent';
import PaneFooter from './PaneFooter';
import PaneHeader from './PaneHeader';

const noData = {};

// `plain` drops the box styling, for a pane that sits inside another pane's box.
const Pane = ({
  content = null,
  header = null,
  footer = null,
  className = '',
  data = noData,
  plain = false,
}) => (
  <div className={['pane', !plain && 'pane-box', className].filter(Boolean).join(' ')}>
    {header ? <PaneHeader Header={header} data={data} /> : ''}
    {content ? <PaneContent Content={content} data={data} /> : ''}
    {footer ? <PaneFooter Footer={footer} data={data} /> : ''}
  </div>
);

Pane.propTypes = {
  content: PropTypes.any,
  header: PropTypes.any,
  footer: PropTypes.any,
  className: PropTypes.string,
  data: PropTypes.any,
  plain: PropTypes.bool,
};

export default Pane;
