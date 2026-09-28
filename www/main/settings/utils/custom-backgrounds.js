// The user's own background images: saved as JPEGs in
// <userData>/user_backgrounds, listed in the theme picker, and applied as the
// slide background ({ type: 'custom', url }).
import mainStore from '../../common/store/redux/store';
import { setThemeBg } from '../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');
const { webUtils } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const sharp = require('sharp');
const readChunk = require('read-chunk');
const imageType = require('image-type');

const { i18n } = remote.require('./app');

const customBackgroundsPath = path.resolve(remote.app.getPath('userData'), 'user_backgrounds');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'];

const alertError = (message) => {
  // eslint-disable-next-line no-alert
  alert(message);
};

// The file:// URL a background is shown by, and matched against the applied
// one. One form everywhere, with the path encoded (spaces, #, %…).
const backgroundUrl = (filePath) => pathToFileURL(filePath).href;

const ensureFolder = () => fs.promises.mkdir(customBackgroundsPath, { recursive: true });

const isPngOrJpeg = (filePath) => {
  const meta = imageType(readChunk.sync(filePath, 0, 12));
  return !!meta && IMAGE_MIME_TYPES.includes(meta.mime);
};

const applyBackground = (background) => {
  mainStore.dispatch(setThemeBg(background));
  global.core.platformMethod('updateSettings');
};

// The saved backgrounds, newest first: { name, path, url }.
export const listCustomBackgrounds = async () => {
  try {
    await ensureFolder();
    const files = await fs.promises.readdir(customBackgroundsPath);
    const images = files.filter((file) =>
      IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase()),
    );
    const backgrounds = await Promise.all(
      images.map(async (name) => {
        const filePath = path.join(customBackgroundsPath, name);
        const { mtimeMs } = await fs.promises.stat(filePath);
        return { name, path: filePath, url: backgroundUrl(filePath), time: mtimeMs };
      }),
    );
    return backgrounds.sort((a, b) => b.time - a.time);
  } catch (error) {
    alertError(i18n.t('THEMES.DIR_CREATE_ERR', { error }));
    return [];
  }
};

// Saves the image picked in a file input as a JPEG background and applies it.
// Resolves with the background, or null if nothing was saved.
export const addCustomBackgroundFromInput = async (event) => {
  const [file] = event.target.files;
  // Clear the input so picking the same file again still fires a change.
  // eslint-disable-next-line no-param-reassign
  event.target.value = '';
  if (!file) return null;

  try {
    // File.path was removed in Electron 32; webUtils resolves the real path.
    const source = webUtils.getPathForFile(file);
    if (!isPngOrJpeg(source)) {
      alertError(i18n.t('THEMES.ALLOWED_IMGS_MSG'));
      return null;
    }
    await ensureFolder();
    // Saved as JPEG, so named .jpg; anything but letters, digits, - and _ becomes _.
    const name = `${path.parse(file.name).name.replace(/[^\w-]+/g, '_')}.jpg`;
    const target = path.join(customBackgroundsPath, name);
    await sharp(source).jpeg({ mozjpeg: true }).toFile(target);

    const background = { type: 'custom', url: backgroundUrl(target) };
    applyBackground(background);
    return background;
  } catch (error) {
    alertError(i18n.t('THEMES.FILE_VALIDATE_ERR', { error }));
    return null;
  }
};

// Deletes a saved background. Resolves once it's gone (or failed).
export const removeCustomBackground = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    alertError(i18n.t('THEMES.DELETE_ERR', { error }));
  }
};
