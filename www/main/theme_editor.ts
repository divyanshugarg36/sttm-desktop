import { themes, type Theme } from './common/main-app';

const getTheme = (themeKey: string): Theme | undefined =>
  themes.find((theme) => theme.key === themeKey);

export { themes, getTheme };

export default { themes, getTheme };
