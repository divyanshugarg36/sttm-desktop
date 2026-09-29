import { analytics, type Theme } from '../../common/main-app';
import type { ThemeBg } from '../../common/store/redux/userSettingsSlice';

/** A saved custom background, applied over the current theme. */
type CustomBackground = { url: string };

type SetThemeBg = (themeBg: ThemeBg) => void;

const isSameBackground = (a: ThemeBg | undefined, b: ThemeBg) =>
  !!a && !!b && a.type === b.type && a.url === b.url;

// A theme's own background: its video, its image, or none (a plain colour).
export const setDefaultBg = (themeInstance: Theme, setThemeBg: SetThemeBg, themeBg?: ThemeBg) => {
  const hasBackgroundImage = !!themeInstance['background-image'];
  const hasBackgroundVideo = !!themeInstance['background-video'];
  const imageUrl = hasBackgroundImage
    ? `assets/img/custom_backgrounds/${themeInstance['background-image-full']}`
    : false;
  const videoUrl = hasBackgroundVideo ? themeInstance['background-video']! : false;

  const themeBgObj: ThemeBg = {
    type: hasBackgroundVideo ? 'video' : 'default',
    url: hasBackgroundVideo ? videoUrl : imageUrl,
  };
  if (!isSameBackground(themeBg, themeBgObj)) {
    setThemeBg(themeBgObj);
  }
};

// Applies a theme with its own background, or (isCustom) a saved custom
// background ({ url }) over the current theme.
export const applyTheme = (
  themeInstance: Theme | CustomBackground,
  isCustom: boolean | null,
  setTheme: (themeKey: string) => void,
  setThemeBg: SetThemeBg,
  themeBg?: ThemeBg,
) => {
  if (!isCustom) {
    // Not custom: a theme from themes.json.
    const theme = themeInstance as Theme;
    setTheme(theme.key);
    setDefaultBg(theme, setThemeBg, themeBg);
  } else {
    const themeBgObj: ThemeBg = { type: 'custom', url: (themeInstance as CustomBackground).url };
    if (!isSameBackground(themeBg, themeBgObj)) {
      setThemeBg(themeBgObj);
    }
  }
  global.core.platformMethod('updateSettings', undefined);
  analytics.trackEvent({
    category: 'theme',
    action: 'apply-theme',
    label: isCustom ? 'custom' : 'default',
    value: isCustom ? '' : (themeInstance as Theme).key,
  });
};
