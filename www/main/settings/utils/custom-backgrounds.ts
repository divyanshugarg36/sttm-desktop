// The user's own background images: saved as JPEGs in
// <userData>/user_backgrounds, listed in the theme picker, and applied as the
// slide background ({ type: 'custom', url }).
import * as remote from '@electron/remote';
import { webUtils } from 'electron';
import fs from 'fs';
import path from 'path';
import type { ChangeEvent } from 'react';
import sharp from 'sharp';
import readChunk from 'read-chunk';
import imageType from 'image-type';

import mainStore from '../../common/store/redux/store';
import { setThemeBg, type ThemeBg } from '../../common/store/redux/userSettingsSlice';
import { i18n } from '../../common/main-app';

/** A saved background image, as the theme picker lists it. */
export interface CustomBackgroundFile {
  name: string;
  path: string;
  url: string;
  /** When it was saved (its mtime, in ms). */
  time: number;
}

const customBackgroundsPath = path.resolve(remote.app.getPath('userData'), 'user_backgrounds');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg'];

const alertError = (message: string) => {
  // eslint-disable-next-line no-alert
  alert(message);
};

// The URL a background is shown by, and matched against the applied one. The
// main process serves the backgrounds folder on sttm-bg:// (app.js), which
// the dev server's http:// pages can load, unlike file://.
const backgroundUrl = (filePath: string) =>
  `sttm-bg://user/${encodeURIComponent(path.basename(filePath))}`;

const ensureFolder = () => fs.promises.mkdir(customBackgroundsPath, { recursive: true });

const isPngOrJpeg = (filePath: string) => {
  const meta = imageType(readChunk.sync(filePath, 0, 12));
  return !!meta && IMAGE_MIME_TYPES.includes(meta.mime);
};

const applyBackground = (background: ThemeBg) => {
  mainStore.dispatch(setThemeBg(background));
  global.core.platformMethod('updateSettings', undefined);
};

// The saved backgrounds, newest first: { name, path, url }.
export const listCustomBackgrounds = async (): Promise<CustomBackgroundFile[]> => {
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
export const addCustomBackgroundFromInput = async (
  event: ChangeEvent<HTMLInputElement>,
): Promise<ThemeBg | null> => {
  const [file] = event.target.files!;
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

    const background: ThemeBg = { type: 'custom', url: backgroundUrl(target) };
    applyBackground(background);
    return background;
  } catch (error) {
    alertError(i18n.t('THEMES.FILE_VALIDATE_ERR', { error }));
    return null;
  }
};

// Deletes a saved background. Resolves once it's gone (or failed).
export const removeCustomBackground = async (filePath: string) => {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    alertError(i18n.t('THEMES.DELETE_ERR', { error }));
  }
};
