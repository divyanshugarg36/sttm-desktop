import * as CONSTS from './constants';

import * as realm from './realm-search';
import * as sqlite from './sqlite-search';

// The SQLite BaniDB (through @khalisfoundation/banidb) once its file is there,
// Realm until then. Checked per call, so a file that arrives later is used.
let usingSqlite = false;
const backend = () => {
  if (!usingSqlite && sqlite.hasSqliteDB()) {
    usingSqlite = true;
  }
  return usingSqlite ? sqlite : realm;
};

const query = (...args) => backend().query(...args);
const loadShabad = (...args) => backend().loadShabad(...args);
const loadBanis = (...args) => backend().loadBanis(...args);
const loadBani = (...args) => backend().loadBani(...args);
const loadCeremony = (...args) => backend().loadCeremony(...args);
const loadCeremonies = (...args) => backend().loadCeremonies(...args);
const getAng = (...args) => backend().getAng(...args);
const loadAng = (...args) => backend().loadAng(...args);
const getShabad = (...args) => backend().getShabad(...args);
const randomShabad = (...args) => backend().randomShabad(...args);
const getVerse = (...args) => backend().getVerse(...args);
const getFilterOption = (...args) => backend().getFilterOption(...args);

/** Which database the functions read ('sqlite' or 'realm'). */
const activeDatabase = () => (backend() === sqlite ? 'sqlite' : 'realm');

// Re-export CONSTS for use in other areas
export {
  CONSTS,
  query,
  loadShabad,
  loadBanis,
  loadBani,
  loadCeremony,
  loadCeremonies,
  getAng,
  loadAng,
  getShabad,
  randomShabad,
  getVerse,
  getFilterOption,
  activeDatabase,
};
