import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
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

export const HistoryPane = ({ className, paneId }) => {
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
      <div className="history-item-container" key={`history-${element.shabadId}`}>
        <div
          className="history-item-text"
          onClick={() => {
            openShabadFromHistory(element);
          }}
        >
          <p className="history-item gurmukhi">{element.label}</p>
        </div>
        <div className="history-item-options">
          <button
            onClick={(e) => {
              deleteFromHistory(element, e);
            }}
          >
            <Icon name="x" />
          </button>
        </div>
      </div>,
    );
  });

  return (
    <div className={className}>
      <div className={`history-results ${className}`}>
        {historyOrder === 'newest' ? versesMarkup : versesMarkup.slice().reverse()}
      </div>
    </div>
  );
};

HistoryPane.propTypes = {
  className: PropTypes.string,
  paneId: PropTypes.number,
};
