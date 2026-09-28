const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');

const isSameBackground = (a, b) => !!a && !!b && a.type === b.type && a.url === b.url;

// A theme's own background: its video, its image, or none (a plain colour).
export const setDefaultBg = (themeInstance, setThemeBg, themeBg) => {
  const hasBackgroundImage = !!themeInstance['background-image'];
  const hasBackgroundVideo = !!themeInstance['background-video'];
  const imageUrl = hasBackgroundImage
    ? `assets/img/custom_backgrounds/${themeInstance['background-image-full']}`
    : false;
  const videoUrl = hasBackgroundVideo ? themeInstance['background-video'] : false;

  const themeBgObj = {
    type: hasBackgroundVideo ? 'video' : 'default',
    url: hasBackgroundVideo ? videoUrl : imageUrl,
  };
  if (!isSameBackground(themeBg, themeBgObj)) {
    setThemeBg(themeBgObj);
  }
};

// Applies a theme with its own background, or (isCustom) a saved custom
// background ({ url }) over the current theme.
export const applyTheme = (themeInstance, isCustom, setTheme, setThemeBg, themeBg) => {
  if (!isCustom) {
    setTheme(themeInstance.key);
    setDefaultBg(themeInstance, setThemeBg, themeBg);
  } else {
    const themeBgObj = { type: 'custom', url: themeInstance.url };
    if (!isSameBackground(themeBg, themeBgObj)) {
      setThemeBg(themeBgObj);
    }
  }
  global.core.platformMethod('updateSettings');
  analytics.trackEvent({
    category: 'theme',
    action: 'apply-theme',
    label: isCustom ? 'custom' : 'default',
    value: isCustom ? '' : themeInstance.key,
  });
};
