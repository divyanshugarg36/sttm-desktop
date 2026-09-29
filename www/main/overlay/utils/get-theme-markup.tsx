import React from 'react';
import { ButtonCard } from '@khalisfoundation/sikhi-ui';
import { i18n } from '../../common/main-app';

/** An overlay theme preset (configs/overlay_presets.json). */
export interface OverlayPreset {
  label: string;
  bgColor: string;
  textColor: string;
  gurbaniTextColor: string;
}

// A tile per preset, in its colours. Each carries its preset's key (not its
// translated name, which doesn't always make the key, e.g. Black & Blue).
const getThemeMarkup = (
  themeObjects: Record<string, OverlayPreset>,
  handleThemeChange: React.MouseEventHandler<HTMLButtonElement>,
  currentTheme?: string,
) =>
  Object.keys(themeObjects).map((theme) => {
    const preset = themeObjects[theme];
    return (
      <ButtonCard
        key={theme}
        className={`overlay-theme-swatch ${theme === currentTheme ? 'overlay-theme-swatch--active' : ''}`}
        data-theme-name={theme}
        style={{ color: preset.gurbaniTextColor, background: preset.bgColor }}
        onClick={handleThemeChange}
      >
        {i18n.t(`THEMES.${preset.label}`)}
      </ButtonCard>
    );
  });

export default getThemeMarkup;
