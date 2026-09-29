import React from 'react';

import { PrimaryButton } from '@khalisfoundation/sikhi-ui';

import {
  setMiscSlideText,
  setIsMiscSlide,
  setIsMiscSlideGurmukhi,
  setIsAnnouncement,
} from '../../../common/store/redux/navigatorSlice';
import { Icon } from '../../../common/sttm-ui';
import { analytics, i18n } from '../../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import type { BaniControllerItemProps } from '../components/BaniControllerItem';

type BaniControllerItemsOptions = {
  code: string | null;
  adminPin: number | null;
  isAdminPinVisible: boolean;
  setAdminPinVisibility: (isVisible: boolean) => void;
  toggleLockScreen: () => void;
};

const getBaniControllerItems = ({
  code,
  adminPin,
  isAdminPinVisible,
  setAdminPinVisibility,
  toggleLockScreen,
}: BaniControllerItemsOptions): BaniControllerItemProps[] => {
  const { isMiscSlide, isMiscSlideGurmukhi, isAnnouncement } = useAppSelector(
    (state) => state.navigator,
  );
  const dispatch = useAppDispatch();
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
        <PrimaryButton
          className="copy-code-btn"
          size="sm"
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
        </PrimaryButton>
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
              <Icon name={isAdminPinVisible ? 'eye' : 'eye-off'} />
            </span>
          </div>
          <PrimaryButton className="lock-screen-btn" size="sm" onClick={toggleLockScreen}>
            Lock Screen
          </PrimaryButton>
        </div>
      ),
    },
  ];
};

export default getBaniControllerItems;
