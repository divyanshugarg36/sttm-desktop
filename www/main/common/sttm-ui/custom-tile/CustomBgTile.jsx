import React from 'react';
import PropTypes from 'prop-types';
import { ButtonCard, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';
import { classNames } from '../../utils';

const CustomBgTile = ({ customBg, isActive = false, onApply, onRemove }) => {
  const getCustomBgImageForTile = (tile) => ({
    backgroundImage: `url('${tile.url}')`,
  });

  // A user background in the theme picker, with a remove button in its corner.
  return (
    <div className="theme-picker__custom">
      <ButtonCard
        onClick={onApply}
        className={classNames('theme-picker__tile', isActive && 'theme-picker__tile--active')}
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
  customBg: PropTypes.shape({ name: PropTypes.string, url: PropTypes.string }),
  isActive: PropTypes.bool,
  onApply: PropTypes.func,
  onRemove: PropTypes.func,
};

export default CustomBgTile;
