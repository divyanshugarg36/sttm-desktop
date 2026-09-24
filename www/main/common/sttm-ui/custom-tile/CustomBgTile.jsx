import React from 'react';
import PropTypes from 'prop-types';
import Icon from '../icon';

const CustomBgTile = ({ customBg, onApply, onRemove }) => {
  const getCustomBgImageForTile = (tile) => ({
    backgroundImage: `url('${tile['background-image']}')`,
  });

  return (
    <>
      <button
        key={customBg.name}
        onClick={onApply}
        className={`theme-instance`}
        style={getCustomBgImageForTile(customBg)}
      />
      <button key={customBg.backgroundImage} className="delete-button" onClick={onRemove}>
        <Icon name="trash" />
      </button>
    </>
  );
};

CustomBgTile.propTypes = {
  customBg: PropTypes.object,
  onApply: PropTypes.func,
  onRemove: PropTypes.func,
};

export default CustomBgTile;
