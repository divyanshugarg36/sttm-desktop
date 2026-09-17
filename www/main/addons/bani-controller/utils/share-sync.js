import axios from 'axios';

import Noty from 'noty';

import { API_ENDPOINT as SYNC_API_URL } from '../../../common/constants';

const remote = require('@electron/remote');

const { store, i18n } = remote.require('./app');
const analytics = remote.getGlobal('analytics');

/* eslint-disable no-console */
const _ts = () => new Date().toISOString().slice(11, 23);
const dlog = (...a) => console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', _ts(), ...a);
const derr = (...a) => console.error('%c[CTRL-DESK]', 'color:#e33;font-weight:bold', _ts(), ...a);
/* eslint-enable no-console */

function onConnect(namespaceString) {
  dlog('opening socket:', `${SYNC_API_URL}/${namespaceString}`);
  window.socket = window.io(`${SYNC_API_URL}/${namespaceString}`);
}

async function getNewCode(host) {
  let newCode = null;

  try {
    const currentTimestamp = new Date().getTime();

    const beginUrl = `${SYNC_API_URL}/sync/begin/${host}?ts=${currentTimestamp}`;
    dlog('sync/begin →', beginUrl);
    const response = await axios.request(beginUrl);
    const { data: result } = response;
    const {
      data: { namespaceString },
    } = result;
    dlog('sync/begin ← namespaceString:', namespaceString);

    if (window.io !== undefined) {
      window.namespaceString = namespaceString;
      onConnect(namespaceString);
    } else {
      derr('window.io is undefined — socket.io not loaded; cannot open socket');
    }

    newCode = namespaceString;
  } catch (error) {
    derr('sync/begin failed:', error && error.message ? error.message : error);
    analytics.trackEvent({
      category: 'sync',
      action: 'error',
      value: error,
    });
    new Noty({
      type: 'error',
      text: i18n.t('TOOLBAR.SYNC_CONTROLLER.CODE_ERR'),
      timeout: 3000,
      modal: true,
    }).show();
    newCode = null;
  }
  return newCode;
}

const shareSync = {
  async tryConnection() {
    const host = store.get('userId');
    let syncCode = null;

    // if a succesful code already exists, use that or else get new code
    try {
      dlog('tryConnection: reusing existing namespace?', window.namespaceString);
      await axios.get(`${SYNC_API_URL}/sync/join/${window.namespaceString}`);
      syncCode = window.namespaceString;
      dlog('tryConnection: existing code still valid →', syncCode);
    } catch (e) {
      dlog('tryConnection: no valid existing code — requesting a new one');
      syncCode = await getNewCode(host);
    }

    dlog('tryConnection → syncCode:', syncCode);
    return syncCode;
  },
  addEvent(event, data) {
    if (window.socket) {
      dlog('EMIT →', event, data);
      window.socket.emit(event, data);
    } else {
      derr('EMIT dropped — no socket:', event, data);
    }
  },
  addListener(event, cb) {
    if (window.socket) {
      dlog('addListener on', event);
      window.socket.on(event, cb);
    } else {
      derr('addListener failed — no socket:', event);
    }
  },
  async onEnd(namespaceString) {
    dlog('onEnd: disconnecting namespace', namespaceString);
    await axios.request(`${SYNC_API_URL}/sync/end/${namespaceString}`);
    window.socket.disconnect();
    window.socket = null;
    window.namespaceString = null;
  },
};

export default shareSync;
