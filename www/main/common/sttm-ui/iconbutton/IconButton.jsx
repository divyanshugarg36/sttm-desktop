import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

const IconButton = ({ icon, onClick, className = '', ...props }) => (
  <PrimaryButton
    className={`icon-button ${className}`.trim()}
    mode="icon"
    variant="amber"
    size="sm"
    shape="rounded-md"
    onClick={onClick}
    {...props}
  >
    <Icon name={icon} />
  </PrimaryButton>
);

IconButton.propTypes = {
  icon: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default IconButton;
