import fetch from 'node-fetch';
import moment from 'moment';
import * as electron from 'electron';

import settings from './settings';
import tingle from './common/vendor/tingle';
import { savedSettings } from './common/store/user-settings/get-saved-user-settings';
import { applyUserSettings } from './common/store/user-settings/apply-user-settings';
import { API_ENDPOINT } from './api-config';
import { analytics, i18n } from './common/main-app';

// const isOnline = require('is-online');

/** A message from the desktop notifications API. */
interface NotificationRow {
  Created: string;
  Title: string;
  Content: string;
}

/** The notifications API's response (undefined when it couldn't be read). */
export interface NotificationsMessage {
  rows?: NotificationRow[];
}

const modal = new tingle.Modal({
  footer: true,
  stickyFooter: false,
  cssClass: ['notifications-modal'],
  closeMethods: ['overlay', 'button', 'escape'],
});

const closeBtn = 'Close';
modal.addFooterBtn(closeBtn, 'tingle-btn tingle-btn--pull-right tingle-btn--default', () => {
  modal.close();
});

// format the date default to "Month Day, Year"
const formatDate = (dateString: string, format = 'LL') => moment(dateString).format(format);

const stripScripts = (string: string) => {
  const div = document.createElement('div');
  div.innerHTML = string;
  const scripts = div.getElementsByTagName('script');
  let i = scripts.length;
  while (i > 0) {
    i -= 1;
    scripts[i].parentNode!.removeChild(scripts[i]);
  }
  return div.innerHTML;
};

const scriptTagCheckRegEx = /<[^>]*script/i;

const parseContent = (contentString: string) => {
  if (scriptTagCheckRegEx.test(contentString)) {
    return stripScripts(contentString); // this might be overkill.
  }
  return contentString;
};

const createNotificationContent = (msgList: NotificationRow[]) => {
  let html = `<h1 class="model-title">${i18n.t('OTHERS.WHATS_NEW')}</h1> <div class="messages">`;

  msgList.forEach((item) => {
    html += '<div class="row">';
    html += `<div class="date">${formatDate(item.Created)}</div>`;
    html += `<div class="title">${item.Title}</div>`;
    html += `<div class="content">${parseContent(item.Content)}</div>`;
    html += '</div>';
  });
  html += '</div>';

  return html;
};

const showNotificationsModal = (message?: NotificationsMessage) => {
  if (message && message.rows && message.rows.length > 0) {
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    global.core.platformMethod('updateNotificationsTimestamp', time);
    const content = createNotificationContent(message.rows);
    // set content
    modal.setContent(content);
    // open modal
    modal.open();
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
