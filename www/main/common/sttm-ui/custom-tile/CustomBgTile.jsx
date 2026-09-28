import React from 'react';
import PropTypes from 'prop-types';
import { ButtonCard, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

const CustomBgTile = ({ customBg, onApply, onRemove }) => {
  const getCustomBgImageForTile = (tile) => ({
    backgroundImage: `url('${tile['background-image']}')`,
  });

  // A user background in the theme picker, with a remove button in its corner.
  return (
    <div className="theme-picker__custom">
      <ButtonCard
        onClick={onApply}
        className="theme-picker__tile"
        style={getCustomBgImageForTile(customBg)}
      />
      <PrimaryButton
        className="theme-picker__remove"
        variant="destructive"
        mode="icon"
        size="xs"
        shape="circle"
        aria-label="Remove background"
        onClick={onRemove}
      >
        <Icon name="trash" />
      </PrimaryButton>
    </div>
  );
};

CustomBgTile.propTypes = {
  customBg: PropTypes.object,
  onApply: PropTypes.func,
  onRemove: PropTypes.func,
};

export default CustomBgTile;
