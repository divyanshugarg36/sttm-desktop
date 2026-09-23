import React from 'react';

import { useSelector, useDispatch } from 'react-redux';

import {
  setMiscSlideText,
  setIsMiscSlide,
  setIsMiscSlideGurmukhi,
  setIsAnnouncement,
} from '../../../common/store/redux/navigatorSlice';

const remote = require('@electron/remote');

const { i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

const getBaniControllerItems = ({
  code,
  adminPin,
  isAdminPinVisible,
  setAdminPinVisibility,
  toggleLockScreen,
}) => {
  const { isMiscSlide, isMiscSlideGurmukhi, isAnnouncement } = useSelector(
    (state) => state.navigator,
  );
  const dispatch = useDispatch();
  return [
    {
      title: i18n.t('TOOLBAR.SYNC_CONTROLLER.SANGAT_SYNC'),
      description: (
        <>
          {i18n.t('TOOLBAR.SYNC_CONTROLLER.SYNC_DESC.1')} <strong>sttm.co/sync</strong>
          {i18n.t('TOOLBAR.SYNC_CONTROLLER.SYNC_DESC.2')}
        </>
      ),
      control: (
        <button
          className="button copy-code-btn"
          onClick={() => {
            if (code) {
              if (!isAnnouncement) {
                dispatch(setIsAnnouncement(true));
              }
              if (!isMiscSlide) {
                dispatch(setIsMiscSlide(true));
              }
              if (isMiscSlideGurmukhi) {
                dispatch(setIsMiscSlideGurmukhi(false));
              }
              // ToDo: Remove Math.random() and fix easy peasy state update issue
              const garbageValue = Math.random();
              const syncString = i18n.t('TOOLBAR.SYNC_CONTROLLER.SYNC_STRING', {
                garbageValue,
                code,
              });
              dispatch(setMiscSlideText(syncString));
              analytics.trackEvent({
                category: 'controller',
                action: 'codePresented',
                label: 'present code',
                value: true,
              });
              analytics.trackEvent({
                category: 'controller',
                action: 'codePresented',
                value: true,
              });
            }
          }}
        >
          {i18n.t('TOOLBAR.SYNC_CONTROLLER.PRESENT_CODE')}
        </button>
      ),
    },
    {
      title: i18n.t('TOOLBAR.BANI_CONTROLLER'),
      description: (
        <>
          {i18n.t('TOOLBAR.BANI_DESC.1')}
          <strong>sttm.co/control</strong> {i18n.t('TOOLBAR.BANI_DESC.2')}
        </>
      ),
      control: (
        <div>
          <div className="large-text">
            <span className="admin-pin">
              {i18n.t('TOOLBAR.SYNC_CONTROLLER.PIN')}:
              {isAdminPinVisible && adminPin ? adminPin : '...'}
            </span>
            <span className="hide-btn" onClick={() => setAdminPinVisibility(!isAdminPinVisible)}>
              <i className={`fa ${isAdminPinVisible ? 'fa-eye' : 'fa-eye-slash'}`} />
            </span>
          </div>
          <button className="button lock-screen-btn" onClick={toggleLockScreen}>
            Lock Screen
          </button>
        </div>
      ),
    },
  ];
};

export default getBaniControllerItems;
