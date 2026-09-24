import React from 'react';
import PropTypes from 'prop-types';
import { iconMap } from '@khalisfoundation/sikhi-ui';
import {
  ArrowLeftCircle,
  ArrowLongLeft,
  ArrowRightCircle,
  ClockCircle,
  Dots,
  EyeOff,
  Flower,
  Heart,
  Lock,
  LockOpen,
  Login,
  Logout,
  MinusCircle,
  Target,
  Trash,
  TypeBold,
  TypeItalic,
  VolumeHigh,
  X,
} from '@mynaui/icons-react';

// Icons sikhi-ui doesn't ship yet, from the same Mynaui set its own icons come from.
const extraIcons = {
  'arrow-left-circle': ArrowLeftCircle,
  'arrow-long-left': ArrowLongLeft,
  'arrow-right-circle': ArrowRightCircle,
  bold: TypeBold,
  clock: ClockCircle,
  dots: Dots,
  'eye-off': EyeOff,
  flower: Flower,
  heart: Heart,
  italic: TypeItalic,
  lock: Lock,
  'lock-open': LockOpen,
  login: Login,
  logout: Logout,
  'minus-circle': MinusCircle,
  target: Target,
  trash: Trash,
  'volume-high': VolumeHigh,
  x: X,
};

// A sikhi-ui (or Mynaui) icon inside an <i>, drawn at 1em in currentColor like
// the icon font it replaces, so the app's `i` styles still size and colour it.
const Icon = ({ name, className = '', children, ...props }) => {
  const Svg = iconMap[name] || extraIcons[name];
  if (!Svg) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  return (
    <i className={`app-icon ${className}`.trim()} {...props}>
      <Svg width="1em" height="1em" aria-hidden="true" />
      {children}
    </i>
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default Icon;
