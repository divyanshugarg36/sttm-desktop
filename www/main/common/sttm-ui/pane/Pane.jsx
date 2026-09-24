import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@khalisfoundation/sikhi-ui';
import PaneContent from './PaneContent';
import PaneFooter from './PaneFooter';
import PaneHeader from './PaneHeader';

const noData = {};

const Pane = ({ content = null, header = null, footer = null, className = '', data = noData }) => (
  <Box variant="cool" className={`pane ${className}`.trim()}>
    {header ? <PaneHeader Header={header} data={data} /> : ''}
    {content ? <PaneContent Content={content} data={data} /> : ''}
    {footer ? <PaneFooter Footer={footer} data={data} /> : ''}
  </Box>
);

Pane.propTypes = {
  content: PropTypes.any,
  header: PropTypes.any,
  footer: PropTypes.any,
  className: PropTypes.string,
  data: PropTypes.any,
};

export default Pane;
