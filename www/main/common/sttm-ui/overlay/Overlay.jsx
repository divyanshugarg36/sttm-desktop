import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

const Overlay = ({ onScreenClose, children, className }) => (
  <div className={`backdrop ${className}`} onClick={onScreenClose}>
    {children}
    <PrimaryButton
      className="close-screen"
      variant="ghost"
      mode="icon"
      size="sm"
      shape="circle"
      onClick={onScreenClose}
    >
      <Icon name="x" />
    </PrimaryButton>
  </div>
);

Overlay.propTypes = {
  onScreenClose: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Overlay;
