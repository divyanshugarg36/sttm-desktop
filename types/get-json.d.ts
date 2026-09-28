declare module 'get-json' {
  /** Fetches a URL and parses it as JSON; the callback gets an error or the data. */
  export default function getJSON<T = unknown>(
    url: string,
    callback: (error: Error | null, response: T) => void,
  ): Promise<T>;
}
