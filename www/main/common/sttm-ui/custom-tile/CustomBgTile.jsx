import React from 'react';
import PropTypes from 'prop-types';
import { ButtonCard, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

const CustomBgTile = ({ customBg, onApply, onRemove }) => {
  const getCustomBgImageForTile = (tile) => ({
    backgroundImage: `url('${tile['background-image']}')`,
  });

  return (
    <>
      <ButtonCard
        key={customBg.name}
        onClick={onApply}
        className="theme-instance"
        style={getCustomBgImageForTile(customBg)}
      />
      <PrimaryButton
        key={customBg.backgroundImage}
        className="delete-button"
        variant="destructive"
        mode="icon"
        size="xs"
        shape="circle"
        onClick={onRemove}
      >
        <Icon name="trash" />
      </PrimaryButton>
    </>
  );
};

CustomBgTile.propTypes = {
  customBg: PropTypes.object,
  onApply: PropTypes.func,
  onRemove: PropTypes.func,
};

export default CustomBgTile;
