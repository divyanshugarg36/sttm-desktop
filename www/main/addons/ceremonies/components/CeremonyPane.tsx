import React, { useState, useEffect, useRef } from 'react';
import anvaad from 'anvaad-js';
import { Box, Toggle } from '@khalisfoundation/sikhi-ui';

import { MultipaneDropdown, Tile, VideoWithOverlay } from '../../../common/sttm-ui';
import { ceremoniesFilter } from '../../../common/constants';
import { classNames } from '../../../common/utils';

import { getUserPreferenceFor } from '../utils';
import { applyTheme } from '../../../settings/utils';
import {
  setTheme as setThemeAction,
  setThemeBg as setThemeBgAction,
  type ThemeBg,
} from '../../../common/store/redux/userSettingsSlice';
import {
  setPane1,
  setPane2,
  setPane3,
  setCeremonyId,
  setIsCeremonyBani,
  setIsSundarGutkaBani,
} from '../../../common/store/redux/navigatorSlice';
import { getTheme } from '../../../theme_editor';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import { analytics, i18n, store, type Theme } from '../../../common/main-app';
// import { loadCeremony } from '../../../navigator/utils';

type CeremonyPaneProps = {
  onScreenClose: (event?: React.MouseEvent<HTMLElement>) => void;
  id: number;
  name: string;
  token: string | undefined;
};

const CeremonyPane = ({ token, name, id, onScreenClose }: CeremonyPaneProps) => {
  const dispatch = useAppDispatch();
  const setTheme = (value: string) => dispatch(setThemeAction(value));
  const setThemeBg = (value: ThemeBg) => dispatch(setThemeBgAction(value));
  const { pane1, pane2, pane3 } = useAppSelector((state) => state.navigator);
  const {
    theme: currentTheme,
    currentWorkspace,
    defaultPaneId,
  } = useAppSelector((state) => state.userSettings);

  const [paneSelectorActive, setPaneSelectorActive] = useState(false);

  const paneSelector = useRef<HTMLDivElement>(null);

  const { ceremonyId, isCeremonyBani, isSundarGutkaBani } = useAppSelector(
    (state) => state.navigator,
  );

  const paneId = token;
  const [currentCeremony, setCurrentCeremony] = useState(id);
  // Kept here too: the stored preference doesn't re-render the pane.
  const [isEnglish, setIsEnglish] = useState(() => !!getUserPreferenceFor('english', token));
  const [isRm, setIsRm] = useState(() => !!getUserPreferenceFor('rm', token));

  useEffect(() => {
    if (currentCeremony === 5 && !getUserPreferenceFor('rm', token)) {
      const ceremonyToLoad =
        ceremoniesFilter.raagmalaMap[id as keyof typeof ceremoniesFilter.raagmalaMap];
      setCurrentCeremony(ceremonyToLoad);
    }
  }, []);

  const openPaneMenu = (e: React.MouseEvent, theme: Theme) => {
    paneSelector.current!.style.left = `${e.clientX - 100}px`;
    if (window.innerHeight - e.clientY > 200) {
      paneSelector.current!.style.top = `${e.clientY - 10}px`;
    } else {
      paneSelector.current!.style.top = `${e.clientY - 195}px`;
    }
    paneSelector.current!.dataset.theme = JSON.stringify(theme);
    setPaneSelectorActive(true);
  };

  // `theme` is a theme, or (from the pane menu) the one openPaneMenu saved as JSON.
  const onThemeClick = (
    _event: React.MouseEvent,
    theme: Theme | string,
    multipaneId: number | null = defaultPaneId,
  ) => {
    let parsedTheme = theme as Theme;
    if (typeof theme === 'string') {
      parsedTheme = JSON.parse(theme) as Theme;
    }
    if (isSundarGutkaBani) {
      dispatch(setIsSundarGutkaBani(false));
    }

    if (ceremonyId !== currentCeremony) {
      dispatch(setCeremonyId(currentCeremony));
    }
    if (!isCeremonyBani) {
      dispatch(setIsCeremonyBani(true));
    }
    onScreenClose();
    if (currentTheme !== parsedTheme.key) {
      applyTheme(parsedTheme, null, setTheme, setThemeBg);
    }
    if (multipaneId !== null) {
      switch (multipaneId) {
        case 1:
          dispatch(
            setPane1({
              ...pane1,
              content: i18n.t('MULTI_PANE.SHABAD'),
              baniType: 'ceremony',
              activeShabad: currentCeremony,
            }),
          );
          break;
        case 2:
          dispatch(
            setPane2({
              ...pane2,
              content: i18n.t('MULTI_PANE.SHABAD'),
              baniType: 'ceremony',
              activeShabad: currentCeremony,
            }),
          );
          break;
        case 3:
          dispatch(
            setPane3({
              ...pane3,
              content: i18n.t('MULTI_PANE.SHABAD'),
              baniType: 'ceremony',
              activeShabad: currentCeremony,
            }),
          );
          break;
        default:
          break;
      }
    }
    analytics.trackEvent({
      category: 'ceremony',
      action: 'theme',
      label: parsedTheme.key,
      value: currentCeremony,
    });
  };

  const toggleOptions = (toggleType: 'english' | 'rm', toggleVar: boolean) => {
    store.setUserPref(`gurbani.ceremonies.ceremony-${token}-${toggleType}`, toggleVar);
    global.platform.updateSettings();
    const ceremonyToLoad =
      toggleType === 'rm' && !toggleVar
        ? ceremoniesFilter.raagmalaMap[id as keyof typeof ceremoniesFilter.raagmalaMap]
        : id;
    // loadCeremony(ceremonyToLoad);
    // make sure when clicked on theme, the correct version is loaded
    setCurrentCeremony(ceremonyToLoad);
  };

  const toggleEnglishExplanations = (isEnglishExplanations: boolean) => {
    setIsEnglish(isEnglishExplanations);
    toggleOptions('english', isEnglishExplanations);
  };

  const toggleRm = (withRaagmala: boolean) => {
    setIsRm(withRaagmala);
    toggleOptions('rm', withRaagmala);
  };

  // Themes from themes.json; the pane assumes each key (and the current theme) exists.
  const themes: Record<string, Theme> = {
    light: getTheme('light-theme')!,
    anandkaraj: getTheme('floral')!,
    anand: getTheme('a-new-day')!,
    akbhogrm: getTheme('khalsa-gold')!,
    current: getTheme(currentTheme)!,
  };

  const openCeremonyFromDropdown = (e: React.MouseEvent<HTMLDivElement>, givenPane: number) => {
    onThemeClick(e, paneSelector.current!.dataset.theme!, givenPane);
    setPaneSelectorActive(false);
  };

  // A tile launches the ceremony in a theme; with multiple panes it first
  // asks which pane.
  const launch = (e: React.MouseEvent, theme: Theme) => {
    if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
      openPaneMenu(e, theme);
    } else {
      onThemeClick(e, theme);
    }
  };

  const themeTiles = [
    { key: 'light', theme: themes.light, label: i18n.t(`THEMES.${themes.light.name}`) },
    { key: 'ceremony', theme: themes[token!], label: i18n.t(`THEMES.${themes[token!].name}`) },
    { key: 'current', theme: themes.current, label: i18n.t('THEMES.CURRENT_THEME') },
  ];

  // A setting row (as in Settings): the option's name, then its switch.
  const optionRow = (
    title: string,
    controlId: string,
    checked: boolean,
    onToggle: (value: boolean) => void,
  ) => (
    <div className="setting-row">
      <div className="setting-row__label">
        <span className="setting-row__title">{title}</span>
      </div>
      <div className="setting-row__control">
        <Toggle
          id={controlId}
          size="lg"
          checked={checked}
          onChange={(event) => onToggle(event.target.checked)}
        />
      </div>
    </div>
  );

  return (
    <Box variant="gradient" className="ceremony-card" id={paneId}>
      <MultipaneDropdown
        paneSelectorActive={paneSelectorActive}
        setPaneSelectorActive={setPaneSelectorActive}
        paneSelector={paneSelector}
        clickHandler={openCeremonyFromDropdown}
      />
      <h3 className="ceremony-card__title">{anvaad.unicode(name)}</h3>

      {ceremoniesFilter.englishToggle.includes(id) &&
        optionRow(
          i18n.t('TOOLBAR.ENG_EXPLANATIONS'),
          `${name}-english-exp-toggle`,
          isEnglish,
          toggleEnglishExplanations,
        )}
      {ceremoniesFilter.raagmalaToggle.includes(id) &&
        optionRow(i18n.t('TOOLBAR.RAAGMALA'), `${name}-rm-toggle`, isRm, toggleRm)}

      <h4 className="ceremony-card__group-title">{i18n.t('TOOLBAR.CHOOSE_THEME')}</h4>
      <div className="theme-picker__tiles ceremony-card__themes">
        {themeTiles.map(({ key, theme, label }) => (
          <Tile
            key={key}
            onClick={(e) => launch(e, theme)}
            className={classNames(
              'theme-picker__tile',
              theme['background-video'] && 'theme-picker__tile--video',
            )}
            theme={theme}
          >
            {theme['background-video'] ? (
              <VideoWithOverlay
                src={theme['background-video']}
                poster={theme['background-video-poster']}
                overlayContent={label}
              />
            ) : (
              label
            )}
          </Tile>
        ))}
      </div>
    </Box>
  );
};

export default CeremonyPane;
