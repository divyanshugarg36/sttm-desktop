import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Badge, PrimaryButton } from '@khalisfoundation/sikhi-ui';
import {
  setActiveShabadId,
  setInitialVerseId,
  setVersesRead,
  setIsCeremonyBani,
  setIsSundarGutkaBani,
  setCeremonyId,
  setSundarGutkaBaniId,
  setHomeVerse,
  setActiveVerseId,
  setSingleDisplayActiveTab,
  setPane1,
  setPane2,
  setPane3,
  setVerseHistory,
} from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');

// History rows match sttm-web's controller history list: a type badge, then
// the label.
const TYPE_BADGE_VARIANT = {
  shabad: 'default',
  bani: 'secondary',
  ceremony: 'warning',
};

export const HistoryPane = ({ className = '', paneId }) => {
  const {
    verseHistory,
    activeShabadId,
    initialVerseId,
    versesRead,
    isCeremonyBani,
    isSundarGutkaBani,
    ceremonyId,
    sundarGutkaBaniId,
    homeVerse,
    activeVerseId,
    historyOrder,
    singleDisplayActiveTab,
    pane1,
    pane2,
    pane3,
  } = useSelector((state) => state.navigator);
  const dispatch = useDispatch();

  const { currentWorkspace, defaultPaneId } = useSelector((state) => state.userSettings);

  const deleteFromHistory = (element, event) => {
    event.stopPropagation();
    const updatedHistory = verseHistory.filter(
      (historyItem) => historyItem.shabadId !== element.shabadId,
    );
    dispatch(setVerseHistory(updatedHistory));
  };

  const openShabadFromHistory = (element) => {
    const currentPane = paneId || defaultPaneId;
    switch (currentPane) {
      case 1:
        dispatch(
          setPane1({
            ...pane1,
            content: i18n.t('MULTI_PANE.SHABAD'),
            activeShabad: element.shabadId,
            activeVerse: element.continueFrom,
            baniType: element.type,
            versesRead: element.versesRead,
            homeVerse: element.homeVerse,
          }),
        );
        break;
      case 2:
        dispatch(
          setPane2({
            ...pane2,
            content: i18n.t('MULTI_PANE.SHABAD'),
            activeShabad: element.shabadId,
            activeVerse: element.continueFrom,
            baniType: element.type,
            versesRead: element.versesRead,
            homeVerse: element.homeVerse,
          }),
        );
        break;
      case 3:
        dispatch(
          setPane3({
            ...pane3,
            content: i18n.t('MULTI_PANE.SHABAD'),
            activeShabad: element.shabadId,
            activeVerse: element.continueFrom,
            baniType: element.type,
            versesRead: element.versesRead,
            homeVerse: element.homeVerse,
          }),
        );
        break;
      default:
        break;
    }
    if (currentWorkspace !== i18n.t('WORKSPACES.MULTI_PANE')) {
      if (singleDisplayActiveTab !== 'shabad') {
        dispatch(setSingleDisplayActiveTab('shabad'));
      }
      if (element.verseId !== initialVerseId) {
        dispatch(setInitialVerseId(element.verseId));
      }
      if (element.homeVerse !== homeVerse) {
        dispatch(setHomeVerse(element.homeVerse));
      }
      if (element.versesRead !== versesRead) {
        dispatch(setVersesRead(element.versesRead));
      }
      if (element.type === 'shabad') {
        if (isSundarGutkaBani) {
          dispatch(setIsSundarGutkaBani(false));
        }
        if (isCeremonyBani) {
          dispatch(setIsCeremonyBani(false));
        }
        if (element.shabadId !== activeShabadId) {
          dispatch(setActiveShabadId(element.shabadId));
        }
      }
      if (element.type === 'ceremony') {
        if (isSundarGutkaBani) {
          dispatch(setIsSundarGutkaBani(false));
        }
        if (!isCeremonyBani) {
          dispatch(setIsCeremonyBani(true));
        }
        if (ceremonyId !== element.shabadId) {
          dispatch(setCeremonyId(element.shabadId));
        }
      }
      if (element.type === 'bani') {
        if (isCeremonyBani) {
          dispatch(setIsCeremonyBani(false));
        }
        if (!isSundarGutkaBani) {
          dispatch(setIsSundarGutkaBani(true));
        }

        if (sundarGutkaBaniId !== element.shabadId) {
          dispatch(setSundarGutkaBaniId(element.shabadId));
        }
      }
      if (element.continueFrom !== activeVerseId) {
        dispatch(setActiveVerseId(element.continueFrom));
      }
    }
  };

  const versesMarkup = [];

  verseHistory.forEach((element) => {
    versesMarkup.push(
      <li
        className="history-list__item"
        key={`history-${element.shabadId}`}
        onClick={() => {
          openShabadFromHistory(element);
        }}
      >
        <Badge variant={TYPE_BADGE_VARIANT[element.type] || 'default'} size="xs" shape="pill">
          {i18n.t(`HISTORY_TYPES.${(element.type || 'shabad').toUpperCase()}`)}
        </Badge>
        <span className="history-list__label gurmukhi">{element.label}</span>
        <PrimaryButton
          className="history-list__delete"
          variant="ghost"
          mode="icon"
          size="xs"
          onClick={(e) => {
            deleteFromHistory(element, e);
          }}
        >
          <Icon name="x" />
        </PrimaryButton>
      </li>,
    );
  });

  return (
    <div className={className}>
      <ul className={`history-results history-list ${className}`}>
        {historyOrder === 'newest' ? versesMarkup : versesMarkup.slice().reverse()}
      </ul>
    </div>
  );
};

HistoryPane.propTypes = {
  className: PropTypes.string,
  paneId: PropTypes.number,
};
