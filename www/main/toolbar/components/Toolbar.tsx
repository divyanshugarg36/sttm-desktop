import React from 'react';
import { SideNav, type SideNavItem } from '@khalisfoundation/sikhi-ui';

import { DEFAULT_OVERLAY } from '../../common/constants';
import { analytics, i18n } from '../../common/main-app';
import { useAppDispatch, useAppSelector } from '../../common/store/redux/hooks';
import { setOverlayScreen } from '../../common/store/redux/appSlice';
import { setCurrentWorkspace } from '../../common/store/redux/userSettingsSlice';
import { Icon } from '../../common/sttm-ui';
import { updateViewerScale } from '../../viewer/utils';
import { classNames } from '../../common/utils';

const Toolbar = () => {
  const { minimizedBySingleDisplay } = useAppSelector((state) => state.navigator);
  const overlayScreen = useAppSelector((state) => state.app.overlayScreen);
  const userToken = useAppSelector((state) => state.app.userToken);
  const { currentWorkspace } = useAppSelector((state) => state.userSettings);
  const dispatch = useAppDispatch();

  // Icon-only rail: the label stays for screen readers (hidden in CSS) and
  // shows as the icon's tooltip.
  const item = (key: string, label: string, icon: string): SideNavItem => ({
    key,
    label,
    icon: <Icon name={icon} title={label} />,
  });
  // Workspaces are keyed by their translated name, which is what the store holds.
  const presenterWorkspace = i18n.t('WORKSPACES.PRESENTER');
  const workspaces = [
    item(i18n.t('WORKSPACES.SINGLE_DISPLAY'), i18n.t('WORKSPACES.SINGLE_DISPLAY'), 'monitor'),
    item(presenterWorkspace, presenterWorkspace, 'presentation'),
    item(i18n.t('WORKSPACES.MULTI_PANE'), i18n.t('WORKSPACES.MULTI_PANE'), 'columns'),
  ];
  const toolbarTop = [
    item('sunder-gutka', i18n.t('TOOLBAR.SUNDAR_GUTKA'), 'sundar-gutka'),
    item('ceremonies', i18n.t('TOOLBAR.CEREMONIES'), 'flower'),
    item('announcement', i18n.t('SHORTCUT_TRAY.ANNOUNCEMENT'), 'volume-high'),
  ];
  const toolbarBottom = [
    item('sync-button', i18n.t('TOOLBAR.BANI_CONTROLLER'), 'bani-controller'),
    userToken
      ? item('auth-dialog', i18n.t('AUTH.LOGOUT_LABEL'), 'logout')
      : item('auth-dialog', i18n.t('AUTH.LOGIN_LABEL'), 'user'),
    item('settings', i18n.t('TOOLBAR.SETTINGS'), 'cog'),
  ];

  // Clicking an item opens its overlay, or closes it when it is already open.
  const toggleOverlay = (itemName: string) => {
    const isSelectedOverlay = overlayScreen === itemName;
    document.body.classList.toggle(`overlay-${itemName}-active`, !isSelectedOverlay);
    dispatch(setOverlayScreen(isSelectedOverlay ? DEFAULT_OVERLAY : itemName));
  };

  const changeWorkspace = (workspace: string) => {
    if (workspace === presenterWorkspace) {
      global.controller['presenter-view']();
    }
    if (currentWorkspace !== workspace) {
      dispatch(setCurrentWorkspace(workspace));
    }
    analytics.trackEvent({
      category: 'workspace',
      action: 'changed',
      label: workspace,
    });
    setTimeout(() => {
      updateViewerScale();
    }, 2500);
  };

  return (
    <div
      className={classNames(
        'toolbar-nav',
        minimizedBySingleDisplay ? 'toolbar-nav--hidden' : 'toolbar-nav--shown',
      )}
    >
      <div className="toolbar-nav__top">
        <SideNav
          className="toolbar-nav__workspaces"
          items={workspaces}
          activeKey={currentWorkspace}
          onSelect={changeWorkspace}
        />
        <SideNav items={toolbarTop} activeKey={overlayScreen} onSelect={toggleOverlay} />
      </div>
      <SideNav
        className="toolbar-nav__bottom"
        items={toolbarBottom}
        activeKey={overlayScreen}
        onSelect={toggleOverlay}
      />
    </div>
  );
};

export default Toolbar;
