import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';

const Overlay = ({ onScreenClose, children, className }) => (
  <div className={`backdrop ${className}`} onClick={onScreenClose}>
    {children}
    <button className="close-screen" onClick={onScreenClose}>
      <Icon name="x" />
    </button>
  </div>
);

Overlay.propTypes = {
  onScreenClose: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Overlay;
