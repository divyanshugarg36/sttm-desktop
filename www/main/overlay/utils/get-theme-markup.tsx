import React from 'react';
import convertToCamelCase from '../../common/utils/convert-to-camel-case';
import { i18n } from '../../common/main-app';

/** An overlay theme preset (configs/overlay_presets.json). */
export interface OverlayPreset {
  label: string;
  bgColor: string;
  textColor: string;
  gurbaniTextColor: string;
}

const getThemeMarkup = (
  themeObjects: Record<string, OverlayPreset>,
  handleThemeChange: React.MouseEventHandler<HTMLDivElement>,
) =>
  Object.keys(themeObjects).map((theme) => {
    const currentTheme = themeObjects[theme];
    const themeClass = i18n.t(`THEMES.${currentTheme.label}`).toLowerCase().split(' ').join('-');

    return (
      <div
        key={`theme-${theme}`}
        className={`overlay-theme-swatch`}
        data-theme-name={convertToCamelCase(themeClass)}
        style={{
          color: currentTheme.gurbaniTextColor,
          background: currentTheme.bgColor,
        }}
        onClick={handleThemeChange}
      >
        <span>{i18n.t(`THEMES.${currentTheme.label}`)}</span>
      </div>
    );
  });

export default getThemeMarkup;
