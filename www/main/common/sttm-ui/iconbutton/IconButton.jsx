import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';

const IconButton = ({ icon, onClick, className }) => (
  <button className={`icon-button ${className}`} onClick={onClick}>
    <Icon name={icon} />
  </button>
);

IconButton.propTypes = {
  icon: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default IconButton;
