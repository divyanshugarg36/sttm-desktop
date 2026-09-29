import React from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

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
  const handleThemeChange = (e: React.MouseEvent<HTMLButtonElement>) => {
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
    <Box variant="gradient" className="theme-selector">
      <h4 className="settings-group__title theme-selector__title">
        {i18n.t(`BANI_OVERLAY.THEME_HEADING`)}
      </h4>
      <div className="theme-selector__tiles">
        {getThemeMarkup(themeObjects, handleThemeChange, overlayTheme)}
      </div>
    </Box>
  );
};
