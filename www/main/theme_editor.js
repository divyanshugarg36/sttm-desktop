const remote = require('@electron/remote');

const { themes } = remote.require('./app');

const getTheme = (themeKey) => themes.find((theme) => theme.key === themeKey);

export { themes, getTheme };

export default { themes, getTheme };
