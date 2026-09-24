const os = require('os');
const remote = require('@electron/remote');

// The first non-loopback IPv4 address across the network interfaces, in the
// order Node lists them, else 127.0.0.1 - the address ip.address() returned.
const getLocalIPv4Address = () => {
  const match = Object.values(os.networkInterfaces())
    .flat()
    .find(
      (details) =>
        details &&
        (details.family === 'IPv4' || details.family === 4) &&
        !details.address.startsWith('127.'),
    );
  return match ? match.address : '127.0.0.1';
};

const getOverlayUrl = () => {
  const overlayPort = remote.getGlobal('overlayPort');
  const host = getLocalIPv4Address();
  return `http://${host}:${overlayPort}/`;
};

export default getOverlayUrl;
