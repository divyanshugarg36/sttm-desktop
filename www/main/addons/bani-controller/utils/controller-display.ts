import themes from '../../../../configs/themes.json';
import type { UserSettingsState } from '../../../common/store/redux/userSettingsSlice';
import type { ControllerDisplay } from '../types';
import { getControllerFontSizes } from './controller-font-sizes';

/**
 * How the viewer shows a slide, so a web controller can preview it the same
 * way: the slide settings, and the theme's colours. A theme's background image
 * or video is a local file, so only its background colour is sent.
 */
export const getControllerDisplay = (userSettings: UserSettingsState): ControllerDisplay => {
  const theme = themes.find(({ key }) => key === userSettings.theme);
  return {
    theme: theme && {
      key: theme.key,
      backgroundColor: theme['background-color'],
      gurbaniColor: theme['gurbani-color'],
      translationColor: theme['translation-color'],
      teekaColor: theme['teeka-color'],
      transliterationColor: theme['transliteration-color'],
    },
    content: ([1, 2, 3] as const).map((n) => ({
      type: userSettings[`content${n}`],
      visible: userSettings[`content${n}Visibility`],
      fontSize: userSettings[`content${n}FontSize`],
    })),
    gurbaniFontSize: userSettings.gurbaniFontSize,
    announcementFontSize: userSettings.announcementsFontSize,
    larivaar: userSettings.larivaar,
    larivaarAssist: userSettings.larivaarAssist,
    larivaarAssistType: userSettings.larivaarAssistType,
    displayVisraams: userSettings.displayVishraams,
    visraamSource: userSettings.vishraamSource,
    visraamType: userSettings.vishraamType,
    leftAlign: userSettings.leftAlign,
    displayNextLine: userSettings.displayNextLine,
    translationEnglishSource: userSettings.translationEnglishSource,
    teekaSource: userSettings.teekaSource,
  };
};

/** Everything the desktop sends the controller about its settings. */
export const getControllerSettings = (userSettings: UserSettingsState) => ({
  fontSizes: getControllerFontSizes(userSettings),
  display: getControllerDisplay(userSettings),
});
