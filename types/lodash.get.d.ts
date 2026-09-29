declare module 'lodash.get' {
  /** The value at a dot-separated path such as 'userPrefs.app.theme'. */
  export default function get(object: object, path: string, defaultValue?: unknown): unknown;
}
