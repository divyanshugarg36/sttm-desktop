import React, { useState, useEffect, useRef } from 'react';
import anvaad from 'anvaad-js';
import { Box } from '@khalisfoundation/sikhi-ui';

import { MultipaneDropdown, Switch, Tile } from '../../../common/sttm-ui';
import { ceremoniesFilter } from '../../../common/constants';

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
    toggleOptions('english', isEnglishExplanations);
  };

  const toggleRm = (isRm: boolean) => {
    toggleOptions('rm', isRm);
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

  return (
    <Box variant="gradient" className="ceremony-pane" id={paneId}>
      {
        <MultipaneDropdown
          paneSelectorActive={paneSelectorActive}
          setPaneSelectorActive={setPaneSelectorActive}
          paneSelector={paneSelector}
          clickHandler={openCeremonyFromDropdown}
        />
      }
      <header className="toolbar-nh navigator-header">
        <span>{anvaad.unicode(name)}</span>
      </header>
      <div className="ceremony-pane-content">
        <div className="ceremony-pane-options" id={`cpo-${paneId}`}>
          {ceremoniesFilter.englishToggle.includes(id) && (
            <Switch
              onToggle={toggleEnglishExplanations}
              value={getUserPreferenceFor('english', token)}
              title={i18n.t('TOOLBAR.ENG_EXPLANATIONS')}
              controlId={`${name}-english-exp-toggle`}
              className={`${name}-english-exp-switch`}
            />
          )}
          {ceremoniesFilter.raagmalaToggle.includes(id) && (
            <Switch
              onToggle={toggleRm}
              value={getUserPreferenceFor('rm', token)}
              title={i18n.t('TOOLBAR.RAAGMALA')}
              controlId={`${name}-rm-toggle`}
              className={`${name}-rm-switch`}
            />
          )}

          <div className="ceremony-pane-themes">
            <div className="ceremony-theme-header"> {i18n.t('TOOLBAR.CHOOSE_THEME')} </div>

            <Tile
              onClick={(e) => {
                if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
                  openPaneMenu(e, themes.light);
                } else {
                  onThemeClick(e, themes.light);
                }
              }}
              className="theme-instance"
              theme={themes.light}
            >
              LIGHT
            </Tile>

            <Tile
              onClick={(e) => {
                if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
                  openPaneMenu(e, themes[token!]);
                } else {
                  onThemeClick(e, themes[token!]);
                }
              }}
              className="theme-instance"
              theme={themes[token!]}
            >
              {themes[token!].name.replace(/_/g, ' ')}
            </Tile>

            <Tile
              onClick={(e) => {
                if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
                  openPaneMenu(e, themes.current);
                } else {
                  onThemeClick(e, themes.current);
                }
              }}
              className="theme-instance"
              theme={themes.current}
            >
              <span className="current-cer-theme"> CURRENT THEME </span>
            </Tile>
          </div>
        </div>
      </div>
    </Box>
  );
};

export default CeremonyPane;
