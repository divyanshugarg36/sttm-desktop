import React, { useEffect, useRef, useState } from 'react';
import { Box, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { Tile, CustomBgTile, VideoWithOverlay, Icon } from '../../common/sttm-ui';
import { classNames } from '../../common/utils';

import {
  applyTheme,
  setDefaultBg,
  listCustomBackgrounds,
  addCustomBackgroundFromInput,
  removeCustomBackground,
} from '../utils';
import type { CustomBackgroundFile } from '../utils/custom-backgrounds';
import {
  setTheme as setThemeAction,
  setThemeBg as setThemeBgAction,
  type ThemeBg,
} from '../../common/store/redux/userSettingsSlice';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import { i18n, themes } from '../../common/main-app';

const themeTypes = [
  { type: 'COLOR', title: 'COLORS' },
  { type: 'BACKGROUND', title: 'BACKGROUNDS' },
  { type: 'SPECIAL', title: 'SPECIAL_CONDITIONS' },
  { type: 'VIDEO', title: 'VIDEOS' },
];

// The theme picker: colour, background, special and video themes as tiles in a
// grid, then the user's own background images.
const ThemeContainer = () => {
  const [customThemes, setCustomThemes] = useState<CustomBackgroundFile[]>([]);
  const uploadInput = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const setTheme = (value: string) => dispatch(setThemeAction(value));
  const setThemeBg = (value: ThemeBg) => dispatch(setThemeBgAction(value));
  const { theme: currentTheme, themeBg } = useAppSelector((state) => state.userSettings);
  const groupThemes = (themeType: string) => themes.filter(({ type }) => type.includes(themeType));

  const refreshCustomThemes = async () => setCustomThemes(await listCustomBackgrounds());

  useEffect(() => {
    refreshCustomThemes();
  }, []);

  const isCustomBg = themeBg && themeBg.type === 'custom';

  // Removing the background in use falls back to the current theme's own.
  const removeCustomTheme = async (tile: CustomBackgroundFile) => {
    await removeCustomBackground(tile.path);
    if (isCustomBg && themeBg.url === tile.url) {
      setDefaultBg(
        themes.find(({ key }) => key === currentTheme)!,
        setThemeBg,
        themeBg,
      );
      global.core.platformMethod('updateSettings', undefined);
    }
    refreshCustomThemes();
  };

  return (
    <Box variant="gradient" className="theme-picker">
      {themeTypes.map(({ type, title }) => (
        <section key={type} className="theme-picker__section">
          <h4 className="theme-picker__title">
            {i18n.t(`THEMES.${title}`)}
            {type === 'VIDEO' && (
              <span className="theme-picker__note">
                {i18n.t('SETTINGS.CHROMECAST_UNAVAILABLE')}
              </span>
            )}
          </h4>
          <div className="theme-picker__tiles">
            {groupThemes(type).map((theme) => (
              <Tile
                key={theme.name}
                onClick={() => applyTheme(theme, false, setTheme, setThemeBg, themeBg)}
                className={classNames(
                  'theme-picker__tile',
                  theme['background-video'] && 'theme-picker__tile--video',
                  !isCustomBg && theme.key === currentTheme && 'theme-picker__tile--active',
                )}
                theme={theme}
              >
                {theme['background-video'] ? (
                  <VideoWithOverlay
                    src={theme['background-video']}
                    poster={theme['background-video-poster']}
                    overlayContent={i18n.t(`THEMES.${theme.name}`)}
                  />
                ) : (
                  i18n.t(`THEMES.${theme.name}`)
                )}
              </Tile>
            ))}
          </div>
        </section>
      ))}

      <section className="theme-picker__section">
        <h4 className="theme-picker__title">{i18n.t(`THEMES.CUSTOM_BACKGROUNDS`)}</h4>
        <div className="theme-picker__upload">
          <PrimaryButton
            variant="outline"
            size="sm"
            leftIcon={<Icon name="plus" />}
            onClick={() => uploadInput.current!.click()}
          >
            {i18n.t('THEMES.NEW_IMAGE')}
          </PrimaryButton>
          <span className="theme-picker__note">{i18n.t('THEMES.RECOMMENDED')}</span>
          <input
            ref={uploadInput}
            className="file-input"
            onChange={async (e) => {
              await addCustomBackgroundFromInput(e);
              refreshCustomThemes();
            }}
            type="file"
            accept="image/png, image/jpeg"
          />
        </div>
        <div className="theme-picker__tiles">
          {customThemes.map((tile) => (
            <CustomBgTile
              key={tile.name}
              customBg={tile}
              isActive={isCustomBg && themeBg.url === tile.url}
              onApply={() => applyTheme(tile, true, setTheme, setThemeBg, themeBg)}
              onRemove={() => removeCustomTheme(tile)}
            />
          ))}
        </div>
      </section>
    </Box>
  );
};

export default ThemeContainer;
