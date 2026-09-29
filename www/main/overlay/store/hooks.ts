import { useDispatch, useSelector } from 'react-redux';

import type { OverlayDispatch, OverlayRootState } from './overlay-store';

// The react-redux hooks typed for the overlay window's store (not the main
// window's): use these in the overlay instead of plain useSelector / useDispatch.
export const useOverlaySelector = useSelector.withTypes<OverlayRootState>();
export const useOverlayDispatch = useDispatch.withTypes<OverlayDispatch>();
