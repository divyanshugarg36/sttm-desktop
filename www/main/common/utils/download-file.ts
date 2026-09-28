// node-fetch (Node's HTTP stack) rather than the renderer's fetch, so remote
// files download without CORS, as they did with `request`.
import fs from 'fs';
import fetch from 'node-fetch';

const PROGRESS_INTERVAL_MS = 1000;
// Abort if no data arrives for this long. node-fetch doesn't end or error the
// body when a connection drops mid-download, so without this it would wait
// forever. An idle limit (not a total one) keeps slow downloads working.
const IDLE_TIMEOUT_MS = 30000;

/** A progress report, in the shape request-progress used. */
export interface DownloadProgress {
  percent: number | null;
  size: { total: number | null; transferred: number };
}

/**
 * Stream `url` to `destination`. Resolves once the file is fully written, and
 * rejects on a non-200 response, a stalled or dropped connection, or a
 * truncated body. `onProgress` gets `{ percent, size: { total, transferred } }`
 * about once a second, with `percent` from 0 to 1 (null when the size isn't
 * known) - the shape request-progress used to report.
 */
export const downloadFile = async (
  url: string,
  destination: string,
  onProgress: (progress: DownloadProgress) => void = () => {},
  { idleTimeoutMs = IDLE_TIMEOUT_MS }: { idleTimeoutMs?: number } = {},
): Promise<void> => {
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`Download failed (${response.status}): ${url}`);
  }

  const total = Number(response.headers.get('content-length')) || null;
  let transferred = 0;
  let lastReport = 0;
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      response.body.destroy(
        new Error(`Download stalled (no data for ${idleTimeoutMs} ms): ${url}`),
      );
    }, idleTimeoutMs);
  };

  response.body.on('data', (chunk: Buffer) => {
    resetIdleTimer();
    transferred += chunk.length;
    const now = Date.now();
    if (now - lastReport >= PROGRESS_INTERVAL_MS) {
      lastReport = now;
      onProgress({ percent: total ? transferred / total : null, size: { total, transferred } });
    }
  });

  try {
    resetIdleTimer();
    await new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(destination);
      response.body.on('error', (error: Error) => {
        file.destroy();
        reject(error);
      });
      file.on('error', reject);
      file.on('finish', resolve);
      response.body.pipe(file);
    });
  } finally {
    clearTimeout(idleTimer);
  }

  if (total && transferred !== total) {
    throw new Error(`Download incomplete (${transferred} of ${total} bytes): ${url}`);
  }
};
