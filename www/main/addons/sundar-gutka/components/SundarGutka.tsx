import React, { useRef, useState } from 'react';
import anvaad from 'anvaad-js';

import { Switch, Overlay, MultipaneDropdown } from '../../../common/sttm-ui';
import ExtraBani from './ExtraBani';
import { convertToHyphenCase } from '../../../common/utils';
import { nitnemBaniIds, popularBaniIds } from '../../../common/constants';
import useLoadBani from '../hooks/use-load-bani';
import {
  setIsSundarGutkaBani,
  setSundarGutkaBaniId,
  setIsCeremonyBani,
  setSingleDisplayActiveTab,
  setInitialVerseId,
  setLineNumber,
  setSavedCrossPlatformId,
  setPane1,
  setPane2,
  setPane3,
} from '../../../common/store/redux/navigatorSlice';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import { analytics, i18n } from '../../../common/main-app';
import type { NamedItem } from '../../utils/convert-db-proxy-to-array';

/** A bani in the list, tagged 'nitnem' / 'popular' for its marker. */
type TaggedBani = NamedItem & { baniTag?: string };

type SundarGutkaProps = {
  isShowTranslitSwitch?: boolean;
  onScreenClose: (event?: React.MouseEvent<HTMLElement>) => void;
};

const SundarGutka = ({ isShowTranslitSwitch = false, onScreenClose }: SundarGutkaProps) => {
  const {
    isSundarGutkaBani,
    sundarGutkaBaniId,
    isCeremonyBani,
    singleDisplayActiveTab,
    initialVerseId,
    lineNumber,
    savedCrossPlatformId,
    pane1,
    pane2,
    pane3,
  } = useAppSelector((state) => state.navigator);

  const { currentWorkspace, defaultPaneId } = useAppSelector((state) => state.userSettings);

  const dispatch = useAppDispatch();

  const { isLoadingBanis, banis } = useLoadBani();
  const [isTranslit, setTranslitState] = useState(false);
  const [isEngTransliterated, setEngTransliterate] = useState(false);
  const [paneSelectorActive, setPaneSelectorActive] = useState(false);

  const paneSelector = useRef<HTMLDivElement>(null);

  const nitnemBanis: TaggedBani[] = [];
  const popularBanis: TaggedBani[] = [];
  const title = i18n.t('TOOLBAR.SUNDAR_GUTKA');
  const hyphenedTitle = convertToHyphenCase(title.toLowerCase());
  const overlayClassName = `ui-${hyphenedTitle}`;
  const blockListId = `${hyphenedTitle}-banis`;
  const blockListItemClassName = `${hyphenedTitle}-bani`;
  const taggedBanis = banis.map((bani) => {
    const b: TaggedBani = bani;
    b.baniTag = '';

    if (nitnemBaniIds.includes(b.id)) {
      b.baniTag = 'nitnem';
      nitnemBanis.push(b);
    }
    if (popularBaniIds.includes(b.id)) {
      b.baniTag = 'popular';
      popularBanis.push(b);
    }

    return b;
  });

  const openPaneMenu = (e: React.MouseEvent, baniId: number) => {
    paneSelector.current!.style.left = `${e.clientX - 100}px`;
    if (window.innerHeight - e.clientY > 200) {
      paneSelector.current!.style.top = `${e.clientY - 10}px`;
    } else {
      paneSelector.current!.style.top = `${e.clientY - 195}px`;
    }
    paneSelector.current!.dataset.baniId = String(baniId);
    setPaneSelectorActive(true);
  };

  const loadBani = (baniId: number, paneId: number | null = null) => {
    if (isCeremonyBani) {
      dispatch(setIsCeremonyBani(false));
    }

    if (!isSundarGutkaBani) {
      dispatch(setIsSundarGutkaBani(true));
    }

    if (sundarGutkaBaniId !== baniId) {
      dispatch(setSundarGutkaBaniId(baniId));
    }

    if (singleDisplayActiveTab !== 'shabad') {
      dispatch(setSingleDisplayActiveTab('shabad'));
    }

    // A bani opened from Sundar Gutka always starts at its first verse. Clear
    // anything that ShabadText would otherwise resume from: the search/history
    // initial verse and a leftover bani controller position.
    if (initialVerseId !== null) {
      dispatch(setInitialVerseId(null));
    }
    if (lineNumber !== null) {
      dispatch(setLineNumber(null));
    }
    if (savedCrossPlatformId !== null) {
      dispatch(setSavedCrossPlatformId(null));
    }

    // Drop the previous verse position carried by the pane. baniOpenedAt lets
    // ShabadText restart the bani even when the same bani is already loaded.
    const freshBani = {
      content: i18n.t('MULTI_PANE.SHABAD'),
      baniType: 'bani',
      activeShabad: baniId,
      activeVerse: '' as const,
      versesRead: [],
      homeVerse: false as const,
      baniOpenedAt: Date.now(),
    };

    if (paneId !== null) {
      switch (paneId) {
        case 1:
          dispatch(setPane1({ ...pane1, ...freshBani }));
          break;
        case 2:
          dispatch(setPane2({ ...pane2, ...freshBani }));
          break;
        case 3:
          dispatch(setPane3({ ...pane3, ...freshBani }));
          break;
        default:
          break;
      }
    }

    analytics.trackEvent({
      category: 'sundar-gutka',
      action: 'bani',
      label: baniId,
    });
    onScreenClose();
  };

  const getBani = (e: React.MouseEvent, baniId: number) => {
    if (currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')) {
      openPaneMenu(e, baniId);
    } else {
      loadBani(baniId, defaultPaneId);
    }
  };

  const openBaniFromDropdown = (_e: React.MouseEvent<HTMLDivElement>, paneId: number) => {
    loadBani(parseInt(paneSelector.current!.dataset.baniId!, 10), paneId);
    setPaneSelectorActive(false);
  };

  return (
    <Overlay onScreenClose={onScreenClose}>
      <div className={`addon-wrapper ${hyphenedTitle}-wrapper`}>
        <div className={`bani-list overlay-ui ${overlayClassName}`}>
          {isLoadingBanis ? (
            <div className="sttm-loader" />
          ) : (
            <>
              <header className="navigator-header">
                {title}
                <div className="transliterate-eng">
                  <span>{i18n.t('SETTINGS.ENGLISH_LANGUAGE')} </span>
                  <div className="switch xs-small">
                    <input
                      id="translate-eng"
                      type="checkbox"
                      checked={isEngTransliterated}
                      onChange={() => {
                        const newState = !isEngTransliterated;
                        setEngTransliterate(newState);
                      }}
                    />
                    <label htmlFor="translate-eng" />
                  </div>
                </div>
              </header>
              {isShowTranslitSwitch && (
                <Switch
                  controlId="translit-switch"
                  className="translit-switch"
                  onToggle={setTranslitState}
                  value={isTranslit}
                />
              )}

              <section className="blocklist">
                {
                  <MultipaneDropdown
                    paneSelectorActive={paneSelectorActive}
                    setPaneSelectorActive={setPaneSelectorActive}
                    paneSelector={paneSelector}
                    clickHandler={openBaniFromDropdown}
                  />
                }
                <ul id={blockListId}>
                  {taggedBanis.map((bani) => (
                    <li
                      key={bani.name}
                      className={blockListItemClassName}
                      onClick={(e) =>
                        currentWorkspace === i18n.t('WORKSPACES.MULTI_PANE')
                          ? openPaneMenu(e, bani.id)
                          : loadBani(bani.id, defaultPaneId)
                      }
                    >
                      <span className={`tag tag-${bani.baniTag}`} />
                      <span className={isEngTransliterated ? 'english-bani' : undefined}>
                        {isEngTransliterated
                          ? anvaad.translit(bani.name)
                          : anvaad.unicode(bani.name)}
                      </span>
                      <span className="translit-bani">{anvaad.translit(bani.name)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>

        {!isLoadingBanis && (
          <div className={`bani-extras overlay-ui ${overlayClassName}`}>
            {nitnemBanis.length > 0 && (
              <ExtraBani
                title="Nitnem Banis"
                banis={nitnemBanis}
                getBani={getBani}
                isEngTransliterated={isEngTransliterated}
              />
            )}
            {popularBanis.length > 0 && (
              <ExtraBani
                title="Popular Banis"
                banis={popularBanis}
                getBani={getBani}
                isEngTransliterated={isEngTransliterated}
              />
            )}
          </div>
        )}
      </div>
    </Overlay>
  );
};

export default SundarGutka;
