import { useState, useEffect } from 'react';
import { toast } from '@khalisfoundation/sikhi-ui';

import { loadCeremonies } from '../../../banidb';
import convertDbProxyToArray from '../../utils/convert-db-proxy-to-array';
import cache from '../ceremonies-cache';

const useLoadCeremonies = () => {
  const [isLoadingCeremonies, setLoadingCeremonies] = useState(false);
  const [ceremonies, setCeremonies] = useState(cache.ceremonies);

  useEffect(() => {
    const fetchCeremoniesFromDb = async () => {
      setLoadingCeremonies(true);

      try {
        const dbProxyObj = await loadCeremonies();
        // resolving proxy
        const ceremoniesArr = convertDbProxyToArray(dbProxyObj);
        cache.ceremonies = ceremoniesArr;
        setCeremonies(ceremoniesArr);
      } catch (error) {
        toast.error(`Was error loading ceremonies : ${error}`, { duration: 5000 });
      } finally {
        setLoadingCeremonies(false);
      }
    };

    // load ceremonies if there is no ceremonies in cache.
    if (!ceremonies.length) {
      fetchCeremoniesFromDb();
    }
  }, []);

  return {
    isLoadingCeremonies,
    ceremonies,
  };
};

export default useLoadCeremonies;
