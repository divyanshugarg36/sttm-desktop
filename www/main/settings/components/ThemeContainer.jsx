import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import { Tile, CustomBgTile, VideoWithOverlay, Icon } from '../../common/sttm-ui';
import { classNames } from '../../common/utils';

import { themes } from '../../theme_editor';
import {
  applyTheme,
  uploadImage,
  setDefaultBg,
  upsertCustomBackgrounds,
  removeCustomBackgroundFile,
} from '../utils';
import {
  setTheme as setThemeAction,
  setThemeBg as setThemeBgAction,
} from '../../common/store/redux/userSettingsSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

const themeTypes = [
  { type: 'COLOR', title: 'COLORS' },
  { type: 'BACKGROUND', title: 'BACKGROUNDS' },
  { type: 'SPECIAL', title: 'SPECIAL_CONDITIONS' },
  { type: 'VIDEO', title: 'VIDEOS' },
];

// The theme picker: colour, background, special and video themes as tiles in a
// grid, then the user's own background images.
const ThemeContainer = () => {
  const [customThemes, setCustomThemes] = useState([]);
  const uploadInput = useRef(null);
  const dispatch = useDispatch();
  const setTheme = (value) => dispatch(setThemeAction(value));
  const setThemeBg = (value) => dispatch(setThemeBgAction(value));
  const { theme: currentTheme, themeBg } = useSelector((state) => state.userSettings);
  const groupThemes = (themeType) => themes.filter(({ type }) => type.includes(themeType));

  useEffect(() => {
    upsertCustomBackgrounds(setCustomThemes);
  }, []);

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
                onClick={() => {
                  if (currentTheme !== theme.key) {
                    applyTheme(theme, false, setTheme, setThemeBg, themeBg);
                  }
                  setDefaultBg(theme, setThemeBg, themeBg);
                }}
                className={classNames(
                  'theme-picker__tile',
                  theme['background-video'] && 'theme-picker__tile--video',
                )}
                theme={theme}
              >
                {theme['background-video'] ? (
                  <VideoWithOverlay
                    src={theme['background-video']}
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
            onClick={() => uploadInput.current.click()}
          >
            {i18n.t('THEMES.NEW_IMAGE')}
          </PrimaryButton>
          <span className="theme-picker__note">{i18n.t('THEMES.RECOMMENDED')}</span>
          <input
            ref={uploadInput}
            className="file-input"
            onChange={async (e) => {
              await uploadImage(e);
              upsertCustomBackgrounds(setCustomThemes);
            }}
            id="themebg-upload"
            type="file"
            accept="image/png, image/jpeg"
          />
        </div>
        <div className="theme-picker__tiles">
          {customThemes.map((tile) => (
            <CustomBgTile
              key={tile.name}
              customBg={tile}
              onApply={() => {
                applyTheme(tile, 'custom', setTheme, setThemeBg);
              }}
              onRemove={() => {
                removeCustomBackgroundFile(tile['background-image-path']);
                upsertCustomBackgrounds(setCustomThemes);
                if (tile['background-image'] === themeBg.url.href) {
                  const currentThemeInstance = themes.filter((theme) => theme.key === currentTheme);
                  setDefaultBg(currentThemeInstance, setThemeBg, themeBg);
                }
              }}
            />
          ))}
        </div>
      </section>
    </Box>
  );
};

ThemeContainer.propTypes = {};

export default ThemeContainer;
