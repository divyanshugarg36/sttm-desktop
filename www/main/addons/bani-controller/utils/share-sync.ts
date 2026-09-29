import axios from 'axios';

import { toast } from '@khalisfoundation/sikhi-ui';

import { API_ENDPOINT as SYNC_API_URL } from '../../../common/constants';
import { analytics, i18n, store } from '../../../common/main-app';
import type { ControllerSocketData, DesktopMessage } from '../types';

/** The sync server's reply to /sync/begin. */
interface SyncBeginResponse {
  data: { namespaceString: string };
}

function onConnect(namespaceString: string) {
  window.socket = window.io!(`${SYNC_API_URL}/${namespaceString}`);
}

async function getNewCode(host: unknown) {
  let newCode = null;

  try {
    const currentTimestamp = new Date().getTime();

    const response = await axios.request<SyncBeginResponse>({
      url: `${SYNC_API_URL}/sync/begin/${host}?ts=${currentTimestamp}`,
    });
    const { data: result } = response;
    const {
      data: { namespaceString },
    } = result;

    if (window.io !== undefined) {
      window.namespaceString = namespaceString;
      onConnect(namespaceString);
    }

    newCode = namespaceString;
  } catch (error) {
    analytics.trackEvent({
      category: 'sync',
      action: 'error',
      value: error,
    });
    toast.error(i18n.t('TOOLBAR.SYNC_CONTROLLER.CODE_ERR'), { duration: 3000 });
    newCode = null;
  }
  return newCode;
}

const shareSync = {
  async tryConnection(): Promise<string | null | undefined> {
    const host = store.get('userId');
    let syncCode: string | null | undefined = null;

    // if a succesful code already exists, use that or else get new code
    try {
      await axios.get(`${SYNC_API_URL}/sync/join/${window.namespaceString}`);
      syncCode = window.namespaceString;
    } catch {
      syncCode = await getNewCode(host);
    }

    return syncCode;
  },
  addEvent(event: 'data', data: DesktopMessage) {
    if (window.socket) {
      window.socket.emit(event, data);
    }
  },
  addListener(event: 'data', cb: (data: ControllerSocketData) => void) {
    if (window.socket) {
      window.socket.on(event, cb);
    }
  },
  async onEnd(namespaceString: string | null) {
    await axios.request({ url: `${SYNC_API_URL}/sync/end/${namespaceString}` });
    window.socket!.disconnect();
    window.socket = null;
    window.namespaceString = null;
  },
};

export default shareSync;
