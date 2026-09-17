import loadVerse from './load-verse';

const loadBani = (BaniId, crossPlatformId, lineCount) => {
  const currentBaniID = global.core.search.getCurrentShabadId().id;
  /* eslint-disable-next-line no-console */
  console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', new Date().toISOString().slice(11, 23), 'loadBani: baniId', BaniId, 'cp-id', crossPlatformId, '| current', currentBaniID, '→', currentBaniID === BaniId ? 'same (loadVerse)' : 'new (search.loadBani)');
  if (currentBaniID === BaniId) {
    loadVerse(crossPlatformId, lineCount);
  } else {
    global.core.search.loadBani(BaniId, null, false, crossPlatformId);
  }
};

export default loadBani;
