import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import getThemeMarkup from '../utils/get-theme-markup';
import {
  setOverlayTheme,
  setTextColor,
  setBgColor,
  setGurbaniTextColor,
} from '../../common/store/redux/baniOverlaySlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');
const { i18n } = remote.require('./app');
const themeObjects = require('../../../configs/overlay_presets.json');

export const ThemeSelector = () => {
  const dispatch = useDispatch();
  const { overlayTheme, gurbaniTextColor, textColor, bgColor } = useSelector(
    (state) => state.baniOverlay,
  );
  const handleThemeChange = (e) => {
    const clickedTheme = e.currentTarget.dataset.themeName;
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
