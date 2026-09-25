import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';
import PropTypes from 'prop-types';

import isOnline from 'is-online';
import { ipcRenderer } from 'electron';

import BaniControllerItem from './BaniControllerItem';
import { Overlay } from '../../../common/sttm-ui';

import { getBaniControllerItems, generateQrCode, shareSync } from '../utils';

import { useNewShabad } from '../../../navigator/search/hooks/use-new-shabad';

import QrCode from './QrCode';

import ConnectionSwitch from './ConnectionSwitch';
import ZoomController from './ZoomController';
import useSocketListeners from '../hooks/use-socket-listeners';
import updateMultipane from '../../../navigator/search/utils/update-multipane';
import {
  setAdminPin,
  setCode,
  setConnection,
} from '../../../common/store/redux/baniControllerSlice';
import { setOverlayScreen, setListeners } from '../../../common/store/redux/appSlice';
import {
  setIsSundarGutkaBani,
  setSundarGutkaBaniId,
  setIsCeremonyBani,
  setCeremonyId,
  setIsMiscSlide,
  setMiscSlideText,
  setIsMiscSlideGurmukhi,
  setSavedCrossPlatformId,
  setLineNumber,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const analytics = remote.getGlobal('analytics');
const { tryConnection, onEnd } = shareSync;

const { i18n } = remote.require('./app');

const BaniController = ({ onScreenClose, className }) => {
  const title = 'Mobile device sync';
  const canvasRef = useRef(null);

  const changeActiveShabad = useNewShabad();
  const updatePane = updateMultipane();

  // Local State
  const [codeLabel, setCodeLabel] = useState('');
  const [isFetchingCode, setFetchingCode] = useState(false);
  const [isAdminPinVisible, setAdminPinVisibility] = useState(true);
  const [socketData, setSocketData] = useState(null);

  // Store State (Redux)
  const isListeners = useSelector((state) => state.app.isListeners);
  const overlayScreen = useSelector((state) => state.app.overlayScreen);
  const { adminPin, code, isConnected } = useSelector((state) => state.baniController);
  const dispatch = useDispatch();

  const {
    activeShabad,
    activeShabadId,
    activeVerseId,
    homeVerse,
    ceremonyId,
    sundarGutkaBaniId,
    isSundarGutkaBani,
    isCeremonyBani,
    isMiscSlide,
    miscSlideText,
    isMiscSlideGurmukhi,
    savedCrossPlatformId,
    lineNumber,
  } = useSelector((state) => state.navigator);

  const {
    gurbaniFontSize,
    content1FontSize,
    content2FontSize,
    content3FontSize,
    baniLength,
    // mangalPosition,
  } = useSelector((state) => state.userSettings);

  const fontSizes = {
    gurbani: parseInt(gurbaniFontSize, 10),
    translation: parseInt(content1FontSize, 10),
    teeka: parseInt(content2FontSize, 10),
    transliteration: parseInt(content3FontSize, 10),
  };

  const showSyncError = (errorMessage) => {
    setCodeLabel(errorMessage);
    if (code !== null) {
      dispatch(setCode(null));
    }
    if (adminPin !== null) {
      dispatch(setAdminPin(null));
    }
  };

  const remoteSyncInit = async () => {
    setFetchingCode(true);

    // 1. check onlineValue
    const onlineValue = await isOnline();
    if (onlineValue) {
      const newCode = await tryConnection();

      if (newCode) {
        const newAdminPin = Math.floor(1000 + Math.random() * 8999);

        dispatch(setCode(newCode));
        dispatch(setAdminPin(newAdminPin));

        generateQrCode(canvasRef.current, newCode);

        dispatch(setConnection(true));
        dispatch(setListeners(true));
        analytics.trackEvent({
          category: 'sync',
          action: 'syncStarted',
        });
      } else {
        showSyncError(i18n.t('TOOLBAR.SYNC_CONTROLLER.CODE_ERR'));
        analytics.trackEvent({
          category: 'sync',
          action: i18n.t('TOOLBAR.SYNC_CONTROLLER.CODE_ERR'),
          label: 'error',
        });
      }
    } else {
      showSyncError(i18n.t('TOOLBAR.SYNC_CONTROLLER.INTERNET_ERR'));
    }

    setFetchingCode(false);
  };

  const syncToggle = async (forceConnect = false) => {
    if (isConnected && !forceConnect) {
      // TODO: Needs to remove this DOM interaction
      document.body.classList.remove('controller-on');
      dispatch(setListeners(false));
      dispatch(setConnection(false));
      onEnd(code);
      dispatch(setCode(null));
      dispatch(setAdminPin(null));
      analytics.trackEvent({
        category: 'sync',
        action: 'syncStopped',
      });
    } else {
      await remoteSyncInit();
    }
  };

  const toggleLockScreen = () => {
    if (overlayScreen !== 'lock-screen') {
      dispatch(setOverlayScreen('lock-screen'));
    }
    analytics.trackEvent({
      category: 'sync',
      action: 'lockScreen',
      label: 'lockScreen button clicked',
    });
  };

  useEffect(() => {
    syncToggle(true);
  }, []);

  useEffect(() => {
    if (isListeners && adminPin) {
      if (window.socket !== undefined) {
        window.socket.on('data', (data) => {
          setSocketData(data);
        });
      }
    }
  }, [isListeners, adminPin]);

  useEffect(() => {
    ipcRenderer.on('bani-controller-data', (event, data) => {
      setSocketData({
        host: 'local-ipc',
        type: data.type,
        ...data,
      });
    });

    return () => {
      ipcRenderer.removeAllListeners('bani-controller-data');
    };
  }, []);

  useEffect(() => {
    useSocketListeners(
      socketData,
      changeActiveShabad,
      adminPin,
      activeShabad,
      activeShabadId,
      activeVerseId,
      homeVerse,
      ceremonyId,
      sundarGutkaBaniId,
      fontSizes,
      baniLength,
      // mangalPosition,
      isSundarGutkaBani,
      isCeremonyBani,
      savedCrossPlatformId,
      (v) => dispatch(setIsCeremonyBani(v)),
      (v) => dispatch(setIsSundarGutkaBani(v)),
      (v) => dispatch(setSundarGutkaBaniId(v)),
      (v) => dispatch(setCeremonyId(v)),
      isMiscSlide,
      miscSlideText,
      isMiscSlideGurmukhi,
      (v) => dispatch(setIsMiscSlide(v)),
      (v) => dispatch(setMiscSlideText(v)),
      (v) => dispatch(setIsMiscSlideGurmukhi(v)),
      (v) => dispatch(setSavedCrossPlatformId(v)),
      lineNumber,
      (v) => dispatch(setLineNumber(v)),
      updatePane,
    );
  }, [socketData]);

  const baniControllerItems = getBaniControllerItems({
    code,
    adminPin,
    isAdminPinVisible,
    setAdminPinVisibility,
    toggleLockScreen,
  });

  return (
    <Overlay onScreenClose={onScreenClose} className={className}>
      <div className="addon-wrapper sync-wrapper overlay-ui ui-sync-button">
        <ZoomController />
        <div className="sync overlay-ui ui-sync-button">
          <header className="sync-header" data-key="MOBILE_DEVICE_SYNC">
            {title}
          </header>
          <Box
            variant="gradient"
            className={`sync-content-wrapper ${isFetchingCode ? 'loading' : ''}`}
          >
            <div className="sync-content">
              {isFetchingCode ? (
                <div className="sttm-loader" />
              ) : (
                <>
                  <div className="sync-code-label">
                    {codeLabel || i18n.t('TOOLBAR.SYNC_CONTROLLER.UNIQUE_CODE_LABEL')}
                  </div>

                  <div className="sync-code-num"> {code || '...'} </div>

                  {baniControllerItems.map((item) => (
                    <BaniControllerItem key={item.title} {...item} />
                  ))}

                  <ConnectionSwitch isConnected={isConnected} syncToggle={syncToggle} />
                </>
              )}
            </div>

            <QrCode canvasRef={canvasRef} />
          </Box>
        </div>
      </div>
    </Overlay>
  );
};

BaniController.propTypes = {
  onScreenClose: PropTypes.func,
  className: PropTypes.string,
};

export default BaniController;
