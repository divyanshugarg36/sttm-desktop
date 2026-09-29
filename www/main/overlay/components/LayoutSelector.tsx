import React from 'react';

const LAYOUTS = ['top', 'bottom', 'split', 'vertical', 'classic'];

type LayoutSelectorProps = {
  /** The layout in use, shown pressed. */
  current?: string;
  changeLayout: React.MouseEventHandler<HTMLElement>;
};

// A button per layout, drawn with bars where that layout puts the text.
const LayoutSelector = ({ current, changeLayout }: LayoutSelectorProps) => (
  <span className="overlay-control-group">
    {LAYOUTS.map((layout) => (
      <button
        type="button"
        key={layout}
        className={`layout-btn ${layout} ${layout === current ? 'layout-btn--active' : ''}`}
        data-layout={layout}
        aria-label={layout}
        aria-pressed={layout === current}
        title={layout}
        onClick={changeLayout}
      >
        <div className="layout-bar layout-bar-1"></div>
        <div className="layout-bar layout-bar-2"></div>
        <div className="layout-bar layout-bar-3"></div>
        <div className="layout-bar layout-bar-4"></div>
        <div className="layout-vertical-bar"></div>
        <div className="layout-classic-bar"></div>
      </button>
    ))}
  </span>
);

export default LayoutSelector;
