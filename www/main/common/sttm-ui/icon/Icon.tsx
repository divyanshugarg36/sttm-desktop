import React from 'react';
import { iconMap } from '@khalisfoundation/sikhi-ui';
import {
  ArrowLongLeft,
  ClockCircle,
  Columns,
  Dots,
  EyeOff,
  Flower,
  Heart,
  Lock,
  LockOpen,
  Login,
  Logout,
  MinusCircle,
  Monitor,
  Presentation,
  Target,
  Trash,
  TypeBold,
  TypeItalic,
  VolumeHigh,
  X,
} from '@mynaui/icons-react';

/** An icon component: an <svg> that takes the usual SVG props. */
type SvgIcon = (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;

// sikhi-ui's icons, looked up by any name.
const sikhiIcons: Record<string, SvgIcon | undefined> = iconMap;

// Icons sikhi-ui doesn't ship yet, from the same Mynaui set its own icons come from.
const extraIcons: Record<string, SvgIcon | undefined> = {
  'arrow-long-left': ArrowLongLeft,
  bold: TypeBold,
  clock: ClockCircle,
  columns: Columns,
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
  monitor: Monitor,
  presentation: Presentation,
  target: Target,
  trash: Trash,
  'volume-high': VolumeHigh,
  x: X,
};

// A sikhi-ui (or Mynaui) icon inside an <i>, drawn at 1em in currentColor like
// the icon font it replaces, so the app's `i` styles still size and colour it.
type IconProps = React.HTMLAttributes<HTMLElement> & {
  name: string;
  className?: string;
  children?: React.ReactNode;
};

const Icon = ({ name, className = '', children, ...props }: IconProps) => {
  const Svg = sikhiIcons[name] || extraIcons[name];
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

export default Icon;
