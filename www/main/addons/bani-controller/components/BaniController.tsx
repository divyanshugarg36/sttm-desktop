import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import isOnline from 'is-online';
import type { IpcRendererEvent } from 'electron';

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

import { analytics, i18n } from '../../../common/main-app';
import { offFromMain, onFromMain } from '../../../common/ipc';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { ControllerMessage, ControllerSocketData } from '../types';

const { tryConnection, onEnd } = shareSync;

type BaniControllerProps = {
  onScreenClose?: React.MouseEventHandler<HTMLElement>;
  className?: string;
};

const BaniController = ({ onScreenClose, className }: BaniControllerProps) => {
  const title = 'Mobile device sync';
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const changeActiveShabad = useNewShabad();
  const updatePane = updateMultipane();

  // Local State
  const [codeLabel, setCodeLabel] = useState('');
  const [isFetchingCode, setFetchingCode] = useState(false);
  const [isAdminPinVisible, setAdminPinVisibility] = useState(true);
  const [socketData, setSocketData] = useState<ControllerSocketData | null>(null);

  // Store State (Redux)
  const isListeners = useAppSelector((state) => state.app.isListeners);
  const overlayScreen = useAppSelector((state) => state.app.overlayScreen);
  const { adminPin, code, isConnected } = useAppSelector((state) => state.baniController);
  const dispatch = useAppDispatch();

  const {
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
  } = useAppSelector((state) => state.navigator);

  const {
    gurbaniFontSize,
    content1FontSize,
    content2FontSize,
    content3FontSize,
    baniLength,
    // mangalPosition,
  } = useAppSelector((state) => state.userSettings);

  const fontSizes = {
    gurbani: parseInt(String(gurbaniFontSize), 10),
    translation: parseInt(String(content1FontSize), 10),
    teeka: parseInt(String(content2FontSize), 10),
    transliteration: parseInt(String(content3FontSize), 10),
  };

  const showSyncError = (errorMessage: string) => {
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
        window.socket!.on('data', (data) => {
          setSocketData(data);
        });
      }
    }
  }, [isListeners, adminPin]);

  useEffect(() => {
    // posted to the main process's /api/bani-control (or sent by
    // send-to-bani-controller): unvalidated, like the socket's messages
    const onBaniControllerData = (event: IpcRendererEvent, data: ControllerMessage) => {
      setSocketData({
        host: 'local-ipc',
        ...data,
      });
    };
    onFromMain('bani-controller-data', onBaniControllerData);

    return () => {
      offFromMain('bani-controller-data', onBaniControllerData);
    };
  }, []);

  useEffect(() => {
    useSocketListeners(socketData, {
      changeActiveShabad,
      adminPin,
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
      setIsCeremonyBani: (v) => dispatch(setIsCeremonyBani(v)),
      setIsSundarGutkaBani: (v) => dispatch(setIsSundarGutkaBani(v)),
      setSundarGutkaBaniId: (v) => dispatch(setSundarGutkaBaniId(v)),
      setCeremonyId: (v) => dispatch(setCeremonyId(v)),
      isMiscSlide,
      miscSlideText,
      isMiscSlideGurmukhi,
      setIsMiscSlide: (v) => dispatch(setIsMiscSlide(v)),
      setMiscSlideText: (v) => dispatch(setMiscSlideText(v)),
      setIsMiscSlideGurmukhi: (v) => dispatch(setIsMiscSlideGurmukhi(v)),
      setSavedCrossPlatformId: (v) => dispatch(setSavedCrossPlatformId(v)),
      lineNumber,
      setLineNumber: (v) => dispatch(setLineNumber(v)),
      updatePane,
    });
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

export default BaniController;
