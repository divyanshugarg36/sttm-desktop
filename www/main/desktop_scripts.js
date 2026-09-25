import tingle from './common/vendor/tingle';
import { downloadFile } from './common/utils/download-file';
import { hasSqliteDB, reopen, sqlitePath } from './banidb';

const { ipcRenderer } = require('electron');
const electron = require('electron');
const extract = require('extract-zip');
const fs = require('fs');
const isOnline = require('is-online');
const path = require('path');
const fetch = require('node-fetch');
const remote = require('@electron/remote');
const moment = require('moment');

const { i18n, isUnsupportedWindow } = remote.require('./app');
const ipc = electron.ipcRenderer;
const userDataPath = remote.app.getPath('userData');
const DB_URL = 'https://banidb.blob.core.windows.net/database';
// The SQLite BaniDB: a zip holding banidb.sqlite, and the zip's MD5.
const database = {
  dbCompressedName: 'sttmdesktop-banidb-sqlite.zip',
  dbName: path.basename(sqlitePath),
  md5: 'sttmdesktop-banidb-sqlite.md5',
};

// A development file (STTM_BANIDB_SQLITE) is used as is, never replaced.
const dbPath = sqlitePath;
const newDBFolder = path.resolve(userDataPath, 'new-db');
const newDBPath = path.resolve(newDBFolder, database.dbName);
// Realm databases of earlier versions
const oldDBs = [
  'data.db',
  'sttmdesktop.realm',
  'sttmdesktop.realm.lock',
  'sttmdesktop.realm.management',
  'sttmdesktop-evergreen-v2.realm',
  'sttmdesktop-evergreen-v2.realm.lock',
  'sttmdesktop-evergreen-v2.realm.management',
  'realm-schema-evergreen.json',
];

const { store } = remote.require('./app');

const POLLING_INTERVAL = 120 * 60000; // poll for new notifications every 2hrs.

function windowAction(e) {
  const win = remote.getCurrentWindow();
  const el = e.currentTarget;
  switch (el.dataset.windowAction) {
    case 'minimize':
      win.minimize();
      break;
    case 'max-restore':
      if (win.isMaximized()) {
        win.unmaximize();
        document.body.classList.remove('maximized');
      } else {
        win.maximize();
        document.body.classList.add('maximized');
      }
      break;
    case 'close':
      win.close();
      break;
    default:
      break;
  }
}

function addBadgeToNotification(msg) {
  if (msg && msg.length > 0) {
    document.getElementById('notifications-icon').classList.add('badge');
  }
}

function checkForNotifcations() {
  let timeStamp = store.get('userPrefs.notification-timestamp');
  if (timeStamp) {
    global.core.menu.getNotifications(timeStamp, global.core.menu.showNotificationsModal);
  } else {
    const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    store.set('userPrefs.notification-timestamp', currentTime);
  }

  setInterval(() => {
    timeStamp = store.get('userPrefs.notification-timestamp');
    global.core.menu.getNotifications(timeStamp, addBadgeToNotification);
  }, POLLING_INTERVAL);
}

const platform = {
  ipc,
  store,

  getDBLastModified() {
    try {
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const lastModified = new Date(stats.mtime);
        const formattedDate = moment(lastModified).format('LL');
        return formattedDate;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  init() {
    // Initialize DB right away if it exists
    if (hasSqliteDB()) {
      // Check if there's a newer version
      if (!process.env.STTM_BANIDB_SQLITE) this.downloadLatestDB();
    } else {
      // Download the DB
      this.downloadLatestDB(true);
    }

    checkForNotifcations();

    if (isUnsupportedWindow) {
      const modal = new tingle.Modal({
        stickyFooter: false,
        closeMethods: ['overlay', 'button', 'escape'],
      });

      modal.setContent(`<h1 class="model-title">${i18n.t('UNSUPPORT_OS')}</h1>`);
      modal.open();
    }
  },

  downloadLatestDB(force = false) {
    if (force) {
      localStorage.setItem('isDbDownloaded', false);
    } else {
      localStorage.setItem('isDbDownloaded', true);
    }
    isOnline().then((online) => {
      if (online) {
        fetch(`${DB_URL}/${database.md5}`)
          .then((response) => (response.status === 200 ? response.text() : null))
          .then((newestDBHash) => {
            if (newestDBHash === null) return null;
            const curDBHash = store.get('curDBHash');
            if (force || curDBHash !== newestDBHash) {
              const dbCompressed = path.resolve(userDataPath, database.dbCompressedName);
              return downloadFile(
                `${DB_URL}/${database.dbCompressedName}`,
                dbCompressed,
                (state) => {
                  const win = remote.getCurrentWindow();
                  win.setProgressBar(state.percent);
                  ipcRenderer.emit('database-progress', JSON.stringify(state));
                },
              ).then(() => {
                ipcRenderer.emit('database-progress', JSON.stringify({ percent: 1 }));
                try {
                  extract(dbCompressed, { dir: newDBFolder }).then(() => {
                    fs.chmodSync(newDBPath, '755');
                    // Save the hash for comparison next time
                    store.set('curDBHash', newestDBHash);
                    // Delete compressed database
                    fs.unlinkSync(dbCompressed);
                    // Replace current DB file with new version
                    fs.renameSync(newDBPath, dbPath);
                    reopen();
                    // Delete old DBs
                    oldDBs.forEach((oldDB) => {
                      fs.rm(
                        path.resolve(userDataPath, oldDB),
                        { recursive: true, force: true },
                        (err1) => {
                          if (err1) {
                            // eslint-disable-next-line no-console
                            console.log(`Could not delete old database ${oldDB}: ${err1}`);
                          }
                        },
                      );
                    });
                    const win = remote.getCurrentWindow();
                    win.setProgressBar(-1);
                  });
                } catch (err) {
                  // handle any errors
                  /* eslint-disable-next-line no-console */
                  console.log(err);
                }
              });
            }
            return null;
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(`Could not update the database: ${error}`);
            remote.getCurrentWindow().setProgressBar(-1);
          });
      } else if (force) {
        global.core.search.offline(10);
      }
    });
  },

  updateSettings() {
    if (global.webview) global.webview.send('update-settings');
    if (global.platform) global.platform.ipc.send('update-settings');
  },

  updateNotificationsTimestamp(time) {
    store.setUserPref('notification-timestamp', time);
  },
};

export default platform;

const $titleButtons = document.querySelectorAll('#titlebar .controls a');
Array.from($titleButtons).forEach((el) => {
  el.addEventListener('click', (e) => windowAction(e));
});

const $minimize = document.querySelectorAll('.navigator-header .toggle-minimize');
const $minimizeIcons = document.querySelectorAll('.navigator-header .toggle-minimize i');

if ($minimize) {
  Array.prototype.forEach.call($minimize, (minimize) => {
    minimize.addEventListener('click', () => {
      Array.prototype.forEach.call($minimizeIcons, (element) => {
        element.classList.toggle('disabled');
      });
      document.getElementById('navigator').classList.toggle('minimized');
      if (global.webview) global.webview.send('navigator-toggled');
    });
  });
}
