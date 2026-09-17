/* We need gurmukhi here to add for history support.
Will no longer be needed when we move to better state management */
const loadShabad = (
  shabadId,
  verseId,
  activeShabadId,
  activeVerseId,
  updateShabad,
  updateVerse,
) => {
  /* eslint-disable-next-line no-console */
  console.log('%c[CTRL-DESK]', 'color:#a0f;font-weight:bold', new Date().toISOString().slice(11, 23), 'loadShabad: shabadId', shabadId, 'verseId', verseId, '| active', activeShabadId, '/', activeVerseId);
  if (activeShabadId === shabadId) {
    if (activeVerseId !== verseId) {
      updateVerse(verseId);
    }
  } else {
    updateShabad(activeShabadId, activeVerseId);
  }
};

export default loadShabad;
