/* eslint-disable max-classes-per-file */
// electron-chromecast ships no types. It discovers cast receivers over mDNS
// and sets up a `chrome.cast` global (a subset of the Chrome Cast sender API);
// only what the viewer uses is declared.

/** A cast receiver found on the network. */
interface ChromecastReceiver {
  friendlyName: string;
  /** The mDNS service's full name (`<name>._googlecast._tcp.local`). */
  service_fullname: string;
  ipAddress: string;
  port: number;
}

declare module 'electron-chromecast' {
  /**
   * Sets the function that picks the receiver to cast to (from those found)
   * when a session is requested.
   */
  const chromecast: (
    requestHandler: (receivers: ChromecastReceiver[]) => Promise<ChromecastReceiver>,
    dev?: boolean,
  ) => void;
  export default chromecast;
}

declare namespace chrome.cast {
  /** An error passed to a cast API's error callback. */
  interface Error {
    code: string;
    description?: string | null;
  }

  interface Session {
    sessionId: string;
    status: string;
    sendMessage(
      namespace: string,
      message: string,
      successCallback: () => void,
      errorCallback: (error: Error) => void,
    ): void;
    addUpdateListener(listener: (isAlive: boolean) => void): void;
    addMessageListener(
      namespace: string,
      listener: (namespace: string, message: string) => void,
    ): void;
    stop(successCallback: () => void, errorCallback: (error: Error) => void): void;
  }

  class SessionRequest {
    constructor(appId: string);
  }

  class ApiConfig {
    constructor(
      sessionRequest: SessionRequest,
      sessionListener: (session: Session) => void,
      receiverListener: (availability: string) => void,
    );
  }

  const ReceiverAvailability: { AVAILABLE: string; UNAVAILABLE: string };

  function initialize(
    apiConfig: ApiConfig,
    successCallback: () => void,
    errorCallback: (error: Error) => void,
  ): void;

  function requestSession(
    successCallback: (session: Session) => void,
    errorCallback: (error: Error) => void,
  ): void;
}
