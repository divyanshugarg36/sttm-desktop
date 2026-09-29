import type { LegacyNameRow } from '../../banidb/sqlite-search';

/** A bani or ceremony as the addons list it. */
export interface NamedItem {
  id: number;
  name: string;
  token: string | undefined;
}

const convertDbProxyToArray = (dbProxyObj: LegacyNameRow[]): NamedItem[] => {
  const banisObject = { ...dbProxyObj };
  const banisArr = Object.keys(banisObject).map((idx) => {
    const { ID, Gurmukhi, Token } = banisObject[Number(idx)];
    return {
      id: ID,
      name: Gurmukhi,
      token: Token,
    };
  });

  return banisArr;
};

export default convertDbProxyToArray;
