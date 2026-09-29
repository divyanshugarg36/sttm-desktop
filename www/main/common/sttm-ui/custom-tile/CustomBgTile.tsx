import React from 'react';
import { ButtonCard, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';
import { classNames } from '../../utils';

/** A user background: its file name and file URL. */
type CustomBg = { name?: string; url?: string };

type CustomBgTileProps = {
  customBg: CustomBg;
  isActive?: boolean;
  onApply?: React.MouseEventHandler<HTMLButtonElement>;
  onRemove?: React.MouseEventHandler<HTMLButtonElement>;
};

const CustomBgTile = ({ customBg, isActive = false, onApply, onRemove }: CustomBgTileProps) => {
  const getCustomBgImageForTile = (tile: CustomBg) => ({
    backgroundImage: `url('${tile.url}')`,
  });

  // A user background in the theme picker, with a remove button in its corner.
  return (
    <div className="theme-picker__custom">
      {/* An empty card: sikhi-ui's types require children, so it gets none explicitly. */}
      <ButtonCard
        onClick={onApply}
        className={classNames('theme-picker__tile', isActive && 'theme-picker__tile--active')}
        style={getCustomBgImageForTile(customBg)}
      >
        {undefined}
      </ButtonCard>
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

export default CustomBgTile;
