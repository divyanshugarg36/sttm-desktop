import React from 'react';

import getThemeMarkup, { type OverlayPreset } from '../utils/get-theme-markup';
import {
  setOverlayTheme,
  setTextColor,
  setBgColor,
  setGurbaniTextColor,
} from '../../common/store/redux/baniOverlaySlice';
import presets from '../../../configs/overlay_presets.json';
import { analytics, i18n } from '../../common/main-app';
import { useOverlayDispatch, useOverlaySelector } from '../store/hooks';

const themeObjects: Record<string, OverlayPreset> = presets;

export const ThemeSelector = () => {
  const dispatch = useOverlayDispatch();
  const { overlayTheme, gurbaniTextColor, textColor, bgColor } = useOverlaySelector(
    (state) => state.baniOverlay,
  );
  const handleThemeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickedTheme = e.currentTarget.dataset.themeName!;
    const clickedThemeObj = themeObjects[clickedTheme];
    if (clickedTheme !== overlayTheme) {
      dispatch(setOverlayTheme(clickedTheme));
      if (clickedThemeObj.textColor !== textColor) {
        dispatch(setTextColor(clickedThemeObj.textColor));
      }
      if (clickedThemeObj.gurbaniTextColor !== gurbaniTextColor) {
        dispatch(setGurbaniTextColor(clickedThemeObj.gurbaniTextColor));
      }
      if (clickedThemeObj.bgColor !== bgColor) {
        dispatch(setBgColor(clickedThemeObj.bgColor));
      }
    }
    analytics.trackEvent({
      category: 'Theme',
      action: 'change theme',
      label: 'theme name',
      value: e.currentTarget.dataset.themeName,
    });
  };

  return (
    <section className="theme-selector">
      <p className="overlay-window-text theme-selector-header">
        {i18n.t(`BANI_OVERLAY.THEME_HEADING`)}
      </p>
      {getThemeMarkup(themeObjects, handleThemeChange)}
    </section>
  );
};
