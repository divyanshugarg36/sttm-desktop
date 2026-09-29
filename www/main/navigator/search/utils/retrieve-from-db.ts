import { getFilterOption } from '../../../banidb';
import type { FilterOptionRow } from '../../../banidb/sqlite-search';
import { i18n } from '../../../common/main-app';
import type { FilterOption } from '../../utils';

/** The writer / raag / source filter's options, labelled from `optionsObj` (ID → text key). */
export const retrieveFilterOption = async (
  optionsObj: Record<string | number, string>,
  type: 'writer' | 'raag' | 'source',
) => {
  const idArray = Object.keys(optionsObj).filter(
    (option) => option.toLowerCase() !== 'all' && option.toLowerCase() !== 'others',
  );
  const retrievedObj = await getFilterOption(type, idArray);
  // The rows, keyed by their index.
  const valueObj = { ...retrievedObj } as unknown as Record<string, FilterOptionRow>;

  const finalArray: FilterOption[] = [
    {
      value: 'all',
      text: i18n.t(`SEARCH.${type.toUpperCase()}S.${optionsObj.all}.TEXT`),
    },
  ];

  Object.keys(valueObj).forEach((idx) => {
    if (type === 'source') {
      const { SourceID } = valueObj[idx] as Record<string, string>;
      finalArray.push({
        value: SourceID,
        text: i18n.t(`SEARCH.${type.toUpperCase()}S.${optionsObj[SourceID]}.TEXT`),
      });
    } else if (type === 'raag') {
      const { RaagEnglish, RaagID } = valueObj[idx] as Record<string, string>;
      finalArray.push({
        value: RaagEnglish,
        text: i18n.t(`SEARCH.${type.toUpperCase()}S.${optionsObj[RaagID]}.TEXT`),
      });
    } else if (type === 'writer') {
      const { WriterEnglish, WriterID } = valueObj[idx] as Record<string, string>;
      finalArray.push({
        value: WriterEnglish,
        text: i18n.t(`SEARCH.${type.toUpperCase()}S.${optionsObj[WriterID]}.TEXT`),
      });
    }
  });

  if (type !== 'source') {
    finalArray.push({
      value: 'others',
      text: i18n.t(`SEARCH.${type.toUpperCase()}S.${optionsObj.others}.TEXT`),
    });
  }
  return finalArray;
};
