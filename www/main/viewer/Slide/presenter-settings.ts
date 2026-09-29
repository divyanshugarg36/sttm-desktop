import type { PresenterSlideSettings } from '@khalisfoundation/sikhi-ui';
import type { UserSettingsState } from '../../common/store/redux/userSettingsSlice';

/** The slide settings (sikhi-ui PresenterSlide) from the user's settings. */
export const toPresenterSettings = (userSettings: UserSettingsState): PresenterSlideSettings => ({
  gurbaniFontSize: userSettings.gurbaniFontSize,
  announcementFontSize: userSettings.announcementsFontSize,
  content: ([1, 2, 3] as const).map((n) => ({
    type: userSettings[`content${n}`],
    visible: userSettings[`content${n}Visibility`],
    fontSize: userSettings[`content${n}FontSize`],
  })),
  larivaar: userSettings.larivaar,
  larivaarAssist: userSettings.larivaarAssist,
  larivaarAssistType: userSettings.larivaarAssistType,
  displayVisraams: userSettings.displayVishraams,
  visraamSource: userSettings.vishraamSource,
  visraamType: userSettings.vishraamType,
  leftAlign: userSettings.leftAlign,
  displayNextLine: userSettings.displayNextLine,
  transitions: userSettings.slideTransitions,
  translationEnglishSource: userSettings.translationEnglishSource,
  teekaSource: userSettings.teekaSource,
});
