import * as CONSTS from './constants';

import * as search from './realm-search';

const {
  query,
  loadShabad,
  loadBanis,
  loadBani,
  loadCeremony,
  loadCeremonies,
  loadVerses,
  getAng,
  loadAng,
  getShabad,
  randomShabad,
  getVerse,
} = search;

// Re-export CONSTS for use in other areas
export {
  CONSTS,
  query,
  loadShabad,
  loadBanis,
  loadBani,
  loadCeremony,
  loadCeremonies,
  loadVerses,
  getAng,
  loadAng,
  getShabad,
  randomShabad,
  getVerse,
};
