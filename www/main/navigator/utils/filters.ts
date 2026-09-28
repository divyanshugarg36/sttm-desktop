/** A search result, as SearchContent lists it. */
export interface SearchResultItem {
  ang: number | undefined;
  raag: string;
  shabadId: number;
  source: string;
  sourceId: string;
  verse: string;
  verseId: number;
  writer: string;
}

/** A writer / raag / source filter option: the value it sets and the text it shows. */
export interface FilterOption {
  value: string;
  text: string;
}

export const filters = (
  allSearchedVerses: SearchResultItem[],
  currentWriter: string,
  currentRaag: string,
  currentSource: string,
  writerArray: FilterOption[],
  raagArray: FilterOption[],
) => {
  let filteredResult = allSearchedVerses;

  // filteres searchedData with selected currentWriter
  if (currentWriter !== 'all' && currentWriter !== 'others') {
    filteredResult = allSearchedVerses.filter((verse) => verse.writer.includes(currentWriter));
  } else if (currentWriter !== 'all' && currentWriter === 'others') {
    filteredResult = allSearchedVerses.filter((verse) =>
      writerArray.every((writer) => !verse.writer.includes(writer.value)),
    );
  }

  // filters searchedData with selected currentRaag
  if (currentRaag !== 'all' && currentRaag !== 'others') {
    filteredResult = filteredResult.filter((verse) => {
      if (!verse.raag) {
        return false;
      }
      return verse.raag.includes(currentRaag);
    });
  } else if (currentRaag !== 'all' && currentRaag === 'others') {
    const allRaags = raagArray;
    filteredResult = filteredResult.filter((verse) => {
      if (!verse.raag) {
        return true;
      }
      return allRaags.every((raag) => !verse.raag.includes(raag.value));
    });
  }

  // filters searchedData with selected currentSource
  if (currentSource !== 'all') {
    filteredResult = filteredResult.filter((verse) => {
      if (!verse.sourceId) {
        return false;
      }
      return verse.sourceId === currentSource;
    });
  }

  return filteredResult;
};
