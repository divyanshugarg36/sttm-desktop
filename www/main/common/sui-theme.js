import {
  applyCSSVariables,
  generateCSSVariables,
  getTheme,
  resolveTheme,
} from '@khalisfoundation/sikhi-ui';

// sikhi-ui's own light or dark theme, following the app theme's type (the
// --sttm-theme-type every app theme sets on <body>). Not sikhi-ui's
// ThemeProvider: it replaces the body's theme-* classes, which the app's
// themes are built on.
const SUI_THEMES = { light: 'khalis-blue-light', dark: 'khalis-blue-dark' };

const variables = {};
const variablesFor = (type) => {
  if (!variables[type]) {
    variables[type] = generateCSSVariables(resolveTheme(getTheme(SUI_THEMES[type])));
  }
  return variables[type];
};

let appliedType = null;
const applyThemeType = () => {
  const themeType = getComputedStyle(document.body).getPropertyValue('--sttm-theme-type').trim();
  const type = themeType === 'dark' ? 'dark' : 'light';
  if (type !== appliedType) {
    appliedType = type;
    applyCSSVariables(document.documentElement, variablesFor(type));
  }
};

/** Apply sikhi-ui's theme now and again whenever the app theme changes. */
export const syncSikhiUiTheme = () => {
  applyThemeType();
  new MutationObserver(applyThemeType).observe(document.body, {
    attributes: true,
    attributeFilter: ['class'],
  });
};
