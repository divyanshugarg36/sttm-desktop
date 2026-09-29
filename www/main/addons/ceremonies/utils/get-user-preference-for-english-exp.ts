import { store } from '../../../common/main-app';

const getUserPreferenceFor = (prefFor: string, token: string | undefined) => {
  const forVal = store.getUserPref(`gurbani.ceremonies.ceremony-${token}-${prefFor}`) as
    boolean | undefined;
  if (forVal === undefined) {
    return true;
  }
  return forVal;
};

export default getUserPreferenceFor;
