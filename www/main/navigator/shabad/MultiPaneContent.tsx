import React, { useEffect } from 'react';
import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import { ShabadText } from './ShabadText';
import { FavoritePane, HistoryPane } from '../misc/components';
import { useSlides } from '../../common/hooks';
import { navigatorActions } from '../../common/store/redux/navigatorSlice';
import { Icon } from '../../common/sttm-ui';
import { i18n } from '../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import type { PaneData, PaneSlotProps } from '../../common/sttm-ui/pane/Pane';

type MultiPaneViewProps = {
  data: PaneData;
};

// What a pane shows: its shabad, history, favourites or misc slides.
const MultiPaneView = ({ data }: MultiPaneViewProps) => {
  const paneId = data.multiPaneId as number;
  const navigatorState = useAppSelector((state) => state.navigator);
  const paneAttributes = navigatorState[`pane${paneId}` as `pane${1 | 2 | 3}`];
  const setPaneAttributes = navigatorActions[`setPane${paneId}` as `setPane${1 | 2 | 3}`];
  const { activePaneId, homeVerse, versesRead } = navigatorState;
  const { setHomeVerse, setVersesRead } = navigatorActions;
  const { currentWorkspace } = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();

  const {
    displayWaheguruSlide,
    displayMoolMantraSlide,
    displayBlankViewer,
    displayAnandSahibBhog,
  } = useSlides();

  useEffect(() => {
    if (activePaneId === paneId) {
      if (homeVerse !== paneAttributes.homeVerse) dispatch(setHomeVerse(paneAttributes.homeVerse));
      if (versesRead !== paneAttributes.versesRead)
        dispatch(setVersesRead(paneAttributes.versesRead));
    }
  }, [activePaneId]);

  useEffect(() => {
    dispatch(setPaneAttributes({ ...paneAttributes, content: i18n.t('MULTI_PANE.SHABAD') }));
  }, [currentWorkspace]);

  const goToShabadBtn = (
    <PrimaryButton
      className="shabad-pane__back-to-shabad"
      variant="ghost"
      size="xs"
      style={paneAttributes.activeShabad ? {} : { display: 'none' }}
      onClick={() => {
        dispatch(setPaneAttributes({ ...paneAttributes, content: i18n.t('MULTI_PANE.SHABAD') }));
      }}
      onMouseEnter={(e) => {
        e.currentTarget.children[0].classList.add('icon-beat');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.children[0].classList.remove('icon-beat');
      }}
    >
      <Icon name="arrow-left" />
      <span>{i18n.t('MULTI_PANE.SHABAD_BTN')}</span>
    </PrimaryButton>
  );

  switch (paneAttributes.content) {
    case i18n.t('MULTI_PANE.CLEAR_PANE'):
      return null;
    case i18n.t('MULTI_PANE.SHABAD'):
      return (
        <ShabadText
          shabadId={paneAttributes.activeShabad}
          baniType={paneAttributes.baniType}
          paneAttributes={paneAttributes}
          setPaneAttributes={setPaneAttributes}
          currentPane={paneId}
        />
      );
    case i18n.t('TOOLBAR.HISTORY'):
      return (
        <>
          {goToShabadBtn}
          <HistoryPane paneId={paneId} />
        </>
      );
    case i18n.t('MULTI_PANE.MISC_SLIDES'):
      return (
        <>
          {goToShabadBtn}
          <ul className="option-list">
            <li
              className="option-list__row"
              onClick={() => displayAnandSahibBhog({ openedFrom: 'multipane-content', paneId })}
            >
              <p className="option-list__label">{i18n.t(`SHORTCUT_TRAY.ANAND_SAHIB`)}</p>
            </li>
            <li
              className="option-list__row"
              onClick={() => displayMoolMantraSlide({ openedFrom: 'multipane-content' })}
            >
              <p className="option-list__label">{i18n.t(`SHORTCUT_TRAY.MOOL_MANTRA`)}</p>
            </li>
            <li
              className="option-list__row"
              onClick={() => displayWaheguruSlide({ openedFrom: 'multipane-content' })}
            >
              <p className="option-list__label">ਵਾਹਿਗੁਰੂ</p>
            </li>
            <li
              className="option-list__row"
              onClick={() => displayBlankViewer({ openedFrom: 'multiplane-content' })}
            >
              <p className="option-list__label">{i18n.t(`SHORTCUT_TRAY.BLANK`)}</p>
            </li>
          </ul>
        </>
      );
    case i18n.t('MULTI_PANE.FAVORITES'):
      return (
        <>
          {goToShabadBtn}
          <FavoritePane paneId={paneId} />
        </>
      );
    default:
      return null;
  }
};

// One root for the view, as the pane slot (`className` is its pane__content class).
const MultiPaneContent = ({ data, className }: PaneSlotProps) => (
  <div className={className}>
    <MultiPaneView data={data} />
  </div>
);
export default MultiPaneContent;
