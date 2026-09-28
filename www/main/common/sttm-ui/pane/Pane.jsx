import React from 'react';
import PropTypes from 'prop-types';

const noData = {};

// The header, content and footer components each render their own root, which
// takes the slot's class (pane__header / pane__content / pane__footer).
// `plain` drops the box styling, for a pane that sits inside another pane's box.
const Pane = ({
  content: Content = null,
  header: Header = null,
  footer: Footer = null,
  className = '',
  data = noData,
  plain = false,
}) => (
  <div className={['pane', !plain && 'pane--box', className].filter(Boolean).join(' ')}>
    {Header ? <Header className="pane__header" data={data} /> : ''}
    {Content ? <Content className="pane__content" data={data} /> : ''}
    {Footer ? <Footer className="pane__footer" data={data} /> : ''}
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
