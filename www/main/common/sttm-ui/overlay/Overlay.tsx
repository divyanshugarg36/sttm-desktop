import React from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';
import Icon from '../icon';

type OverlayProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
  children?: React.ReactNode;
  className?: string;
};

const Overlay = ({ onScreenClose, children, className }: OverlayProps) => (
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

export default Overlay;
