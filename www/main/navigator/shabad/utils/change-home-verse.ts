import type { PaneState } from '../../../common/store/redux/navigatorSlice';

export const changeHomeVerse = (
  verseIndex: number,
  {
    paneAttributes,
    setPaneAttributes,
  }: { paneAttributes: PaneState; setPaneAttributes: (pane: PaneState) => void },
) => {
  if (paneAttributes.homeVerse !== verseIndex) {
    setPaneAttributes({ ...paneAttributes, homeVerse: verseIndex });
  }
};
