declare module 'node-fetch' {
  import type { Readable } from 'stream';

  /** node-fetch v2's response: the body is a Node stream, not a web one. */
  interface Response {
    status: number;
    headers: { get(name: string): string | null };
    body: Readable;
    text(): Promise<string>;
  }

  export default function fetch(url: string): Promise<Response>;
}
