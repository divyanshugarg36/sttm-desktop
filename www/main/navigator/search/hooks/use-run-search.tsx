import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../common/store/redux/hooks';
import { searchShabads, loadAng } from '../../utils';
import { setSearchData } from '../../../common/store/redux/navigatorSlice';

// Runs the search whenever the query, search type or source changes: an ang
// number loads that ang (of the Source filter, or Guru Granth Sahib when it is
// "all"), anything else searches shabads. Waits for the database download to
// finish.
export const useRunSearch = (databaseProgress: number) => {
  const { currentSearchType, currentSource, searchQuery } = useAppSelector(
    (state) => state.navigator,
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const angNumber = parseInt(searchQuery, 10);
    if (databaseProgress >= 1 && searchQuery) {
      if (angNumber) {
        // loadAng shows its own error and resolves empty when there is no such ang.
        loadAng(angNumber, currentSource === 'all' ? undefined : currentSource).then((rows) =>
          dispatch(setSearchData(rows || [])),
        );
      } else {
        searchShabads(searchQuery, currentSearchType, currentSource).then((rows) =>
          searchQuery ? dispatch(setSearchData(rows!)) : dispatch(setSearchData([])),
        );
      }
    }
  }, [searchQuery, currentSearchType, currentSource]);
};
