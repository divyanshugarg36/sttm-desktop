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
        <>
          <span className="sync-pin">
            {i18n.t('TOOLBAR.SYNC_CONTROLLER.PIN')}
            <strong>{isAdminPinVisible && adminPin ? adminPin : '····'}</strong>
          </span>
          <PrimaryButton
            variant="outline"
            mode="icon"
            size="sm"
            shape="circle"
            aria-label={isAdminPinVisible ? 'Hide PIN' : 'Show PIN'}
            onClick={() => setAdminPinVisibility(!isAdminPinVisible)}
          >
            <Icon name={isAdminPinVisible ? 'eye' : 'eye-off'} />
          </PrimaryButton>
          <PrimaryButton
            variant="outline"
            size="sm"
            leftIcon={<Icon name="lock" />}
            onClick={toggleLockScreen}
          >
            {i18n.t('TOOLBAR.SYNC_CONTROLLER.LOCK_SCREEN')}
          </PrimaryButton>
        </>
      ),
    },
  ];
};

export default getBaniControllerItems;
