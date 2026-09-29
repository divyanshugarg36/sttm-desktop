import type { NamedItem } from '../utils/convert-db-proxy-to-array';

const cache: { ceremonies: NamedItem[] } = {
  ceremonies: [],
};

export default cache;
