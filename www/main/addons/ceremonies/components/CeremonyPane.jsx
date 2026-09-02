import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { MultipaneDropdown, Switch, Tile } from '../../../common/sttm-ui';
import { ceremoniesFilter } from '../../../common/constants';

import { getUserPreferenceFor } from '../utils';
import { applyTheme } from '../../../settings/utils';
import {
  setTheme as setThemeAction,
  setThemeBg as setThemeBgAction,
} from '../../../common/store/redux/userSettingsSlice';
import {
  setPane1,
  setPane2,
  setPane3,
  setCeremonyId,
  setIsCeremonyBani,
  setIsSundarGutkaBani,
} from '../../../common/store/redux/navigatorSlice';
// import { loadCeremony } from '../../../navigator/utils';

const remote = require('@electron/remote');

const { store, i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');
const { getTheme } = require('../../../theme_editor');

const CeremonyPane = ({ token, name, id, onScreenClose }) => {
  const dispatch = useDispatch();
  const setTheme = (value) => dispatch(setThemeAction(value));
  const setThemeBg = (value) => dispatch(setThemeBgAction(value));
  const { pane1, pane2, pane3 } = useSelector((state) => state.navigator);
  const {
    theme: currentTheme,
    currentWorkspace,
    defaultPaneId,
  } = useSelector((state) => state.userSettings);

  const [paneSelectorActive, setPaneSelectorActive] = useState(false);

  const paneSelector = useRef(null);

  const { ceremonyId, isCeremonyBani, isSundarGutkaBani } = useSelector((state) => state.navigator);

  const paneId = token;
  const [currentCeremony, setCurrentCeremony] = useState(id);

  useEffect(() => {
    if (currentCeremony === 5 && !getUserPreferenceFor('rm', token)) {
      const ceremonyToLoad = ceremoniesFilter.raagmalaMap[id];
      setCurrentCeremony(ceremonyToLoad);
    }
  }, []);

  const openPaneMenu = (e, theme) => {
    paneSelector.current.style.left = `${e.clientX - 100}px`;
    if (window.innerHeight - e.clientY > 200) {
      paneSelector.current.style.top = `${e.clientY - 10}px`;
    } else {
      paneSelector.current.style.top = `${e.clientY - 195}px`;
    }
    paneSelector.current.dataset.theme = JSON.stringify(theme);
    setPaneSelectorActive(true);
  };

  const onThemeClick = (event, theme, multipaneId = defaultPaneId) => {
    let parsedTheme = theme;
    if (typeof theme === 'string') {
      parsedTheme = JSON.parse(theme);
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

  const toggleOptions = (toggleType, toggleVar) => {
    store.setUserPref(`gurbani.ceremonies.ceremony-${token}-${toggleType}`, toggleVar);
    global.platform.updateSettings();
    const ceremonyToLoad =
      toggleType === 'rm' && !toggleVar ? ceremoniesFilter.raagmalaMap[id] : id;
    // loadCeremony(ceremonyToLoad);
    // make sure when clicked on theme, the correct version is loaded
    setCurrentCeremony(ceremonyToLoad);
  };

  const toggleEnglishExplanations = (isEnglishExplanations) => {
    toggleOptions('english', isEnglishExplanations);
  };

  const toggleRm = (isRm) => {
    toggleOptions('rm', isRm);
  };

  const themes = {
    light: getTheme('light-theme'),
    anandkaraj: getTheme('floral'),
    anand: getTheme('a-new-day'),
    akbhogrm: getTheme('khalsa-gold'),
    current: getTheme(currentTheme),
  };

  const openCeremonyFromDropdown = (e, givenPane) => {
    onThemeClick(e, paneSelector.current.dataset.theme, givenPane);
    setPaneSelectorActive(false);
  };

  return (
    <div className="ceremony-pane" id={paneId}>
      {
        <MultipaneDropdown
          paneSelectorActive={paneSelectorActive}
          setPaneSelectorActive={setPaneSelectorActive}
          paneSelector={paneSelector}
          clickHandler={openCeremonyFromDropdown}
        />
      }
      <header className="toolbar-nh navigator-header">
        <span className="gurmukhi">{name}</span>
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
                  openPaneMenu(e, themes[token]);
                } else {
                  onThemeClick(e, themes[token]);
                }
              }}
              className="theme-instance"
              theme={themes[token]}
            >
              {themes[token].name.replace(/_/g, ' ')}
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
    </div>
  );
};

CeremonyPane.propTypes = {
  onScreenClose: PropTypes.func,
  id: PropTypes.number,
  name: PropTypes.string,
  token: PropTypes.string,
};

export default CeremonyPane;
