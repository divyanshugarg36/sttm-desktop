import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@khalisfoundation/sikhi-ui';

import isOnline from 'is-online';
import type { IpcRendererEvent } from 'electron';

import BaniControllerItem from './BaniControllerItem';
import { Overlay } from '../../../common/sttm-ui';

import { getBaniControllerItems, generateQrCode, shareSync, getControllerSettings } from '../utils';

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
  setIsAnnouncement,
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
    isAnnouncement,
    savedCrossPlatformId,
    lineNumber,
  } = useAppSelector((state) => state.navigator);

  const userSettings = useAppSelector((state) => state.userSettings);
  const { baniLength } = userSettings;
  // mangalPosition,

  const controllerSettings = getControllerSettings(userSettings);

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
      controllerSettings,
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
      isAnnouncement,
      setIsAnnouncement: (v) => dispatch(setIsAnnouncement(v)),
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

  // Laid out like Settings: the sync code, then what it's for (Sangat Sync,
  // the Bani Controller) as titled groups of setting rows; Zoom captions on a
  // card beside it.
  return (
    <Overlay onScreenClose={onScreenClose} className={className}>
      <div className="addon-wrapper sync-wrapper">
        <Box variant="gradient" className="sync-card">
          <h3 className="sync-card__title">{i18n.t('TOOLBAR.MOBILE_DEVICE_SYNC')}</h3>
          {isFetchingCode ? (
            <div className="sttm-loader" />
          ) : (
            <>
              <div className="sync-card__code">
                <span className="sync-card__code-label">
                  {codeLabel || i18n.t('TOOLBAR.SYNC_CONTROLLER.UNIQUE_CODE_LABEL')}
                </span>
                <span className="sync-card__code-num">{code || '...'}</span>
              </div>

              {baniControllerItems.map((item) => (
                <BaniControllerItem key={item.title} {...item} />
              ))}
            </>
          )}
          <QrCode canvasRef={canvasRef} />
          {!isFetchingCode && (
            <ConnectionSwitch isConnected={isConnected} syncToggle={syncToggle} />
          )}
        </Box>
        <ZoomController />
      </div>
    </Overlay>
  );
};

export default BaniController;
