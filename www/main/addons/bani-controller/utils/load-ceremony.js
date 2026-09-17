import loadVerse from './load-verse';

const loadCeremony = (ceremonyId, crossPlatformId, lineCount) => {
  const currentCeremonyID = global.core.search.getCurrentShabadId().id;
  /* eslint-disable-next-line no-console */
  console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', new Date().toISOString().slice(11, 23), 'loadCeremony: ceremonyId', ceremonyId, 'cp-id', crossPlatformId, '| current', currentCeremonyID, '→', currentCeremonyID === ceremonyId ? 'same (loadVerse)' : 'new (search.loadCeremony)');
  if (currentCeremonyID === ceremonyId) {
    loadVerse(crossPlatformId, lineCount);
  } else {
    global.core.search.loadCeremony(ceremonyId, null, false, crossPlatformId);
  }
};

export default loadCeremony;
