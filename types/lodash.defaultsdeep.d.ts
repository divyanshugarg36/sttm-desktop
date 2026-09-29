declare module 'lodash.defaultsdeep' {
  /**
   * Fills `object`'s missing properties, recursively, from each source in
   * turn. Mutates and returns `object`.
   */
  export default function defaultsDeep<T extends object>(object: T, ...sources: object[]): T;
}
