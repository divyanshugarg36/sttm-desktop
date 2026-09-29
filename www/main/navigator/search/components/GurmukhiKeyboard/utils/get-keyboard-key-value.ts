import { defaultMatraValue } from '../constants';
import { getMatraAkhar } from './get-matra-akhar';

export const getKeyboardKeyValue = (keyboardKey: string, query: string) => {
  const labelVal = Object.keys(defaultMatraValue).includes(keyboardKey)
    ? getMatraAkhar(keyboardKey, query)
    : keyboardKey;

  const lastChar: string | string[] = query[query.length - 1] || [];

  if (lastChar.includes(labelVal)) {
    return keyboardKey;
  }
  return labelVal;
};
