import React from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

// Any other prop (style, disabled, title…) goes to the PrimaryButton.
type IconButtonProps = Omit<React.ComponentProps<typeof PrimaryButton>, 'children'> & {
  icon: string;
};

const IconButton = ({ icon, onClick, className = '', ...props }: IconButtonProps) => (
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

export default IconButton;
