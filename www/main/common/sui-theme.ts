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
const SUI_THEMES = { light: 'khalis-blue-light', dark: 'khalis-blue-dark' } as const;

type ThemeType = keyof typeof SUI_THEMES;

const variables: Partial<Record<ThemeType, Record<string, string>>> = {};
const variablesFor = (type: ThemeType) => {
  if (!variables[type]) {
    // Both keys are sikhi-ui's built-in themes, so getTheme always finds them.
    variables[type] = generateCSSVariables(resolveTheme(getTheme(SUI_THEMES[type])!));
  }
  return variables[type];
};

let appliedType: ThemeType | null = null;
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
