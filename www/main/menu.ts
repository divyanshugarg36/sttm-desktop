import fetch from 'node-fetch';
import moment from 'moment';
import * as electron from 'electron';

import settings from './settings';
import { showNotificationsDialog, type NotificationRow } from './notifications-dialog';
import { savedSettings } from './common/store/user-settings/get-saved-user-settings';
import { applyUserSettings } from './common/store/user-settings/apply-user-settings';
import { API_ENDPOINT } from './api-config';
import { analytics } from './common/main-app';

// const isOnline = require('is-online');

/** The notifications API's response (undefined when it couldn't be read). */
export interface NotificationsMessage {
  rows?: NotificationRow[];
}

const showNotificationsModal = (message?: NotificationsMessage) => {
  if (message && message.rows && message.rows.length > 0) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    global.core.platformMethod('updateNotificationsTimestamp', time);
    showNotificationsDialog(message.rows);
  }
};

const getNotifications = (
  timeStamp: unknown,
  callback: (message?: NotificationsMessage) => void,
) => {
  fetch(`${API_ENDPOINT}/messages/desktop/${typeof timeStamp === 'string' ? timeStamp : ''}`)
    .then((response) => response.text())
    .then((body) => {
      let message: NotificationsMessage | undefined;
      try {
        message = JSON.parse(body);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
      return message;
    })
    // No response at all (offline, network error): no message, as before.
    .catch(() => undefined)
    .then((message) => callback(message));
};

// On href clicks, open the link in actual browser
document.body.addEventListener('click', (e) => {
  // Only links have an href; for anything else it's undefined.
  const target = e.target as HTMLAnchorElement;
  const link = target.href;
  if (target.href) {
    e.preventDefault();
    electron.shell.openExternal(link);
  }
});

const menu = {
  settings,

  init() {
    const $preferencesOpen = document.querySelectorAll('.preferences-open');
    $preferencesOpen.forEach(($menuToggle) => {
      $menuToggle.addEventListener('click', menu.showSettingsTab);
    });

    applyUserSettings(savedSettings);
  },

  getNotifications,

  showNotificationsModal,

  showSettingsTab(fromMainMenu?: unknown) {
    // search.activateNavLink('settings', true);
    // search.activateNavPage('session', { id: 'settings', label: i18n.t('TOOLBAR.SETTINGS') });

    const isPresenterView = document.body.classList.contains('presenter-view');
    const settingsViewType = isPresenterView ? 'from_presenter_view' : 'not_from_presenter_view';
    const settingsClickSource = fromMainMenu ? 'menu_settings' : 'hamburger_settings';
    analytics.trackEvent({
      category: settingsClickSource,
      action: 'open_settings',
      label: settingsViewType,
    });

    const sessionPage = document.querySelector('#session-page')!;
    sessionPage.classList.add('bounce-animate');
    sessionPage.addEventListener('webkitAnimationEnd', () => {
      sessionPage.classList.remove('bounce-animate');
    });
  },

  toggleMenu(pageSelector = '#menu-page') {
    document.querySelector(pageSelector)!.classList.toggle('active');
  },
};

export default menu;
