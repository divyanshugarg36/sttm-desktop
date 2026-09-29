import * as electron from 'electron';
import { remote } from './common/remote';

import { updateViewerScale } from './viewer/utils';
import { changeFontSize, changeVisibility } from './quick-tools-utils';
import { analytics, mainApp as main } from './common/main-app';

const { app, dialog, Menu } = remote;
const { store, appstore, i18n, isUnsupportedWindow } = main;

// Two roles keep the lowercase spelling the menu has always used; Electron's
// types now list them as selectAll / hideOthers.
type MenuRole = Electron.MenuItemConstructorOptions['role'];

const appName = i18n.t('APPNAME');

const updateMenu: Electron.MenuItemConstructorOptions[] = [];

if (!isUnsupportedWindow) {
  updateMenu.push(
    {
      label: i18n.t('MENU.APP.VERSION', { version: main.appVersion }),
      enabled: false,
    },
    {
      label: i18n.t('MENU.APP.DB_VERSION', { version: global.platform.getDBLastModified() }),
      enabled: false,
    },
    {
      label: i18n.t('MENU.UPDATE.CHECK'),
      accelerator: 'CmdOrCtrl+U',
      click: () => {
        analytics.trackEvent({
          category: 'menu',
          action: 'check-update',
        });
        main.checkForUpdates(true);
      },
      // Only show if not in a platform-specific app store
      visible: !appstore,
    },
    {
      label: i18n.t('MENU.UPDATE.CHECKING'),
      enabled: false,
      visible: false,
    },
    {
      label: i18n.t('MENU.UPDATE.DOWNLOADING'),
      enabled: false,
      visible: false,
    },
    {
      label: i18n.t('MENU.UPDATE.INSTALL_AND_RESTART'),
      click: () => {
        analytics.trackEvent({
          category: 'menu',
          action: 'install-restart',
        });
        main.autoUpdater.quitAndInstall();
      },
      visible: false,
    },
  );
}

const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  {
    label: i18n.t('MENU.EDIT.SELF'),
    submenu: [
      {
        label: i18n.t('MENU.EDIT.UNDO'),
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: i18n.t('MENU.EDIT.REDO'),
        accelerator: 'CmdOrCtrl+Shift+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('MENU.EDIT.CUT'),
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: i18n.t('MENU.EDIT.COPY'),
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: i18n.t('MENU.EDIT.PASTE'),
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: i18n.t('MENU.EDIT.SELECT_ALL'),
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall' as MenuRole,
      },
    ],
  },
  {
    label: i18n.t('MENU.WINDOW.SELF'),
    role: 'window',
    submenu: [
      {
        label: i18n.t('MENU.WINDOW.BANI_OVERLAY'),
        accelerator: 'CmdOrCtrl+Alt+O',
        click: () => {
          main.openSecondaryWindow('overlayWindow');
        },
      },
      {
        label: i18n.t('MENU.WINDOW.MINIMIZE'),
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: i18n.t('MENU.WINDOW.CLOSE'),
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  },
  {
    label: i18n.t('MENU.CAST.SELF'),
    submenu: [
      {
        label: i18n.t('MENU.CAST.SEARCH'),
        accelerator: 'CmdOrCtrl+Alt+C',
        click: () => {
          global.webview!.send('search-cast');
        },
      },
      {
        label: i18n.t('MENU.CAST.STOP'),
        visible: false,
        click: () => {
          global.webview!.send('stop-cast');
        },
      },
    ],
  },
];

const devMenu: Electron.MenuItemConstructorOptions[] = [];

if (process.env.NODE_ENV === 'development') {
  devMenu.push({
    label: i18n.t('MENU.DEV.SELF'),
    submenu: [
      {
        label: i18n.t('MENU.DEV.DEVELOPER_TOOLS'),
        accelerator: 'CmdOrCtrl+Alt+I',
        click: () => {
          remote.getCurrentWindow().webContents.toggleDevTools();
        },
      },
      {
        label: i18n.t('MENU.DEV.RELOAD'),
        accelerator: 'CmdOrCtrl+R',
        click: () => {
          remote.getCurrentWindow().reload();
        },
      },
    ],
  });
}

const winMenu: Electron.MenuItemConstructorOptions[] = [
  {
    label: i18n.t('MENU.FILE'),
    submenu: [
      {
        type: 'separator',
      },
      {
        label: i18n.t('MENU.APP.QUIT', { appName }),
        accelerator: 'Ctrl+Q',
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'quit',
          });
          app.quit();
        },
      },
    ],
  },
  ...menuTemplate,
  {
    label: i18n.t('MENU.HELP.SELF'),
    submenu: [
      {
        label: '',
        enabled: false,
      },
      ...updateMenu,
      {
        label: i18n.t('MENU.HELP.GUIDE'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'guide',
          });
          main.openSecondaryWindow('helpWindow');
        },
      },
      {
        label: i18n.t('MENU.HELP.SHORTCUT_LEGEND'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'shortcut-legend',
          });
          main.openSecondaryWindow('shortcutLegend');
        },
      },
      {
        label: i18n.t('MENU.HELP.CHANGELOG'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'changelog',
          });
          main.openSecondaryWindow('changelogWindow');
        },
      },
    ],
  },
  ...devMenu,
  {
    label: i18n.t('MENU.HELP.DONATE'),
    click: () => {
      analytics.trackEvent({
        category: 'menu',
        action: 'donate',
      });
      electron.shell.openExternal('https://khalisfoundation.org/donate/');
    },
  },
  {
    label: i18n.t('MENU.WINDOW.BANI_OVERLAY'),
    click: () => {
      main.openSecondaryWindow('overlayWindow');
    },
  },
];

const macMenu: Electron.MenuItemConstructorOptions[] = [
  {
    label: appName,
    submenu: [
      {
        label: i18n.t('MENU.APP.ABOUT', { appName }),
        role: 'about',
      },
      ...updateMenu,
      {
        type: 'separator',
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('MENU.APP.SERVICES'),
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('MENU.APP.HIDE', { appName }),
        accelerator: 'Cmd+H',
        role: 'hide',
      },
      {
        label: i18n.t('MENU.APP.HIDE_OTHERS'),
        accelerator: 'Cmd+Alt+H',
        role: 'hideothers' as MenuRole,
      },
      {
        type: 'separator',
      },
      {
        label: i18n.t('MENU.APP.QUIT', { appName }),
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  ...menuTemplate,
  {
    label: i18n.t('MENU.HELP.SELF'),
    submenu: [
      {
        label: i18n.t('MENU.HELP.GUIDE'),
        click: () => {
          main.openSecondaryWindow('helpWindow');
        },
      },
      {
        label: i18n.t('MENU.HELP.SHORTCUT_LEGEND'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'shortcut-legend',
          });
          main.openSecondaryWindow('shortcutLegend');
        },
      },
      {
        label: i18n.t('MENU.HELP.CHANGELOG'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'changelog',
          });
          main.openSecondaryWindow('changelogWindow');
        },
      },
      {
        label: i18n.t('MENU.HELP.DONATE'),
        click: () => {
          analytics.trackEvent({
            category: 'menu',
            action: 'donate',
          });
          electron.shell.openExternal('https://khalisfoundation.org/donate/');
        },
      },
    ],
  },
  ...devMenu,
];

const menu = Menu.buildFromTemplate(
  process.platform === 'darwin' || process.platform === 'linux' ? macMenu : winMenu,
);
if (process.platform === 'darwin' || process.platform === 'linux') {
  Menu.setApplicationMenu(menu);
}

const $menuButton = document.querySelector('.menu-button')!;
$menuButton.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  e.stopPropagation();
  menu.popup({ window: remote.getCurrentWindow() });
});
$menuButton.addEventListener('click', () => {
  const e = $menuButton.ownerDocument.createEvent('MouseEvents');
  e.initMouseEvent(
    'contextmenu',
    true,
    true,
    $menuButton.ownerDocument.defaultView!,
    1,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    2,
    null,
  );
  return !$menuButton.dispatchEvent(e);
});

function checkPresenterView() {
  const inPresenterView = store.getUserPref('app.layout.presenter-view') as boolean;
  const { classList } = document.body;

  classList.toggle('presenter-view', inPresenterView);
  classList.toggle('home', !inPresenterView);
  classList.toggle('scale-viewer', inPresenterView);

  global.platform.ipc.send('presenter-view', inPresenterView);
}

global.platform.ipc.on('presenter-view', () => {
  checkPresenterView();
  updateViewerScale();
});

global.platform.ipc.on('external-display', (_e, args: string) => {
  const { width, height } = JSON.parse(args);
  global.externalDisplay = {
    width,
    height,
  };
  checkPresenterView();
  updateViewerScale();
});
global.platform.ipc.on('remove-external-display', () => {
  delete global.externalDisplay;
  // Note: this removes neither class. classList stringifies the array into the
  // one token 'presenter-view,scale-viewer'. Kept as it was.
  document.body.classList.remove(String(['presenter-view', 'scale-viewer']));
});
window.onresize = () => {
  updateViewerScale();
};

const menuUpdate =
  process.platform === 'darwin' || process.platform === 'linux'
    ? menu.items[0].submenu!
    : menu.items[4].submenu!;
const menuCast = menu.items[3].submenu!;

global.platform.ipc.on('checking-for-update', () => {
  menuUpdate.items[2].visible = false;
  menuUpdate.items[3].visible = true;
});
global.platform.ipc.on('update-available', () => {
  menuUpdate.items[3].visible = false;
  menuUpdate.items[4].visible = true;
});
global.platform.ipc.on('update-not-available', () => {
  menuUpdate.items[3].visible = false;
  menuUpdate.items[2].visible = true;
});
global.platform.ipc.on('update-downloaded', () => {
  menuUpdate.items[4].visible = false;
  menuUpdate.items[5].visible = true;
});
global.platform.ipc.on('send-scroll', (_event, arg) => {
  if (global.webview) global.webview.send('send-scroll', JSON.stringify(arg));
});

global.platform.ipc.on('cast-session-active', () => {
  menuCast.items[0].visible = false;
  menuCast.items[1].visible = true;

  store.setUserPref('app.layout.presenter-view', true);
  checkPresenterView();
  updateViewerScale();

  store.set('userPrefs.slide-layout.display-options.akhandpaatt', false);
  store.set('userPrefs.slide-layout.display-options.disable-akhandpaatt', true);
  if (global.webview) global.webview.send('clear-apv');
  global.platform.ipc.send('clear-apv');

  document.body.classList.remove('akhandpaatt');
  global.core.platformMethod('updateSettings');
  analytics.trackEvent({
    category: 'chromecast',
    action: 'start',
  });
});
global.platform.ipc.on('cast-session-stopped', () => {
  menuCast.items[1].visible = false;
  menuCast.items[0].visible = true;
  store.set('userPrefs.slide-layout.display-options.disable-akhandpaatt', false);
  analytics.trackEvent({
    category: 'chromecast',
    action: 'stop',
  });
});

global.platform.ipc.on('set-user-setting', (_event, settingChanger: string) => {
  const { func, iconType, operation } = JSON.parse(settingChanger) as {
    func: string;
    iconType: string;
    operation?: string;
  };
  if (func === 'size') {
    changeFontSize(iconType, operation === 'plus');
  } else if (func === 'visibility') {
    changeVisibility(iconType);
  }
});

const controller = {
  'presenter-view': function presenterView() {
    checkPresenterView();
    updateViewerScale();
  },

  'live-feed': function livefeed(val: unknown) {
    if (val) {
      const path = dialog.showOpenDialogSync({
        defaultPath: remote.app.getPath('desktop'),
        properties: ['openDirectory'],
      });
      if (path) {
        store.set('userPrefs.app.live-feed-location', path[0]);
      }
    } else {
      store.set('userPrefs.app.live-feed-location', false);
    }
  },
};

export default controller;
