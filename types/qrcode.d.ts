declare module 'qrcode' {
  /** Draws `text` as a QR code on the canvas; the callback gets any error. */
  export function toCanvas(
    canvas: HTMLCanvasElement,
    text: string,
    callback: (error: Error | null | undefined) => void,
  ): void;

  const qrcode: { toCanvas: typeof toCanvas };
  export default qrcode;
}
