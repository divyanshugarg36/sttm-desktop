import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchShabads, loadAng } from '../../utils';
import { setSearchData } from '../../../common/store/redux/navigatorSlice';

// Runs the search whenever the query, search type or source changes: an ang
// number loads that ang, anything else searches shabads. Waits for the
// database download to finish.
export const useRunSearch = (databaseProgress) => {
  const { currentSearchType, currentSource, searchQuery } = useSelector(
    (state) => state.navigator,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const angNumber = parseInt(searchQuery, 10);
    if (databaseProgress >= 1 && searchQuery) {
      if (angNumber) {
        loadAng(angNumber).then((rows) => dispatch(setSearchData(rows)));
      } else {
        searchShabads(searchQuery, currentSearchType, currentSource).then((rows) =>
          searchQuery ? dispatch(setSearchData(rows)) : dispatch(setSearchData([])),
        );
      }
    }
  }, [searchQuery, currentSearchType, currentSource]);
};
