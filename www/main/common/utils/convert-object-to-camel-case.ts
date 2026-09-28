import convertToCamelCase from './convert-to-camel-case';

const convertObjToCamelCase = <T>(obj: Record<string, T>) => {
  const ccObj: Record<string, T> = {};
  Object.keys(obj).forEach((key) => {
    ccObj[convertToCamelCase(key)] = obj[key];
  });
  return ccObj;
};

export default convertObjToCamelCase;
