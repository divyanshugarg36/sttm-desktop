import { useDispatch, useSelector } from 'react-redux';

import type { ViewerDispatch, ViewerRootState } from './viewer-store';

// The react-redux hooks typed for the viewer window's store (not the main
// window's): use these in the viewer instead of plain useSelector / useDispatch.
export const useViewerSelector = useSelector.withTypes<ViewerRootState>();
export const useViewerDispatch = useDispatch.withTypes<ViewerDispatch>();
