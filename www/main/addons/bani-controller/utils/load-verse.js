const remote = require('@electron/remote');

const { store } = remote.require('./app');

/* eslint-disable no-console */
const _ts = () => new Date().toISOString().slice(11, 23);
const dlog = (...a) => console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', _ts(), ...a);
const dwarn = (...a) => console.warn('%c[CTRL-DESK]', 'color:#e80;font-weight:bold', _ts(), ...a);
/* eslint-enable no-console */

const loadVerse = (crossPlatformId, lineCount) => {
  const lineHeight = 35.6; // height of verse in shabad pane, unit: pixels
  const $shabad = document.getElementById('shabad');
  $shabad.parentElement.scrollTo(0, parseInt(lineCount - 1, 10) * lineHeight);
  const currentVerse = document.querySelector(`[data-cp-id = "${crossPlatformId}"]`);
  if (currentVerse) {
    dlog('loadVerse: matched verse cp-id', crossPlatformId, '→ click (highlight)');
    currentVerse.click();
  } else {
    dwarn('loadVerse: NO verse element for cp-id', crossPlatformId, '— deferring via GlobalState selector (verse not in DOM yet / id mismatch)');
    store.set('GlobalState', {
      currentVerseSelector: `[data-cp-id = "${crossPlatformId}"]`,
    });
  }
};

export default loadVerse;
