// react-transition-group ships no types; only what the viewer uses is declared.
declare module 'react-transition-group' {
  import type { ComponentType, ReactNode } from 'react';

  interface CSSTransitionProps {
    in?: boolean;
    /** The transition's length, in ms. */
    timeout: number;
    /** The prefix of the classes applied while entering / exiting (`fade` → `fade-enter` …). */
    classNames?: string;
    unmountOnExit?: boolean;
    children?: ReactNode;
  }

  export const CSSTransition: ComponentType<CSSTransitionProps>;
}
