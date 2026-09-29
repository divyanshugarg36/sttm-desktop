import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// The react-redux hooks typed for the main window's store: use these instead
// of plain useSelector / useDispatch so state and dispatch are typed.
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
