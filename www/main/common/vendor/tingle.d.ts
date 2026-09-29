// Types for the vendored tingle.js (0.13.2, a local fork; see tingle.js). Only
// what the app uses is declared.

interface TingleModal {
  /** The modal's root element (null once destroyed). */
  modal: HTMLDivElement;
  open(): void;
  close(): void;
  destroy(): void;
  isOpen(): boolean;
  setContent(content: string | Node): void;
  addFooterBtn(
    label: string,
    cssClass: string,
    callback: (event: MouseEvent) => void,
  ): HTMLButtonElement;
}

interface TingleModalOptions {
  onClose?: (this: TingleModal) => void;
  onOpen?: (this: TingleModal) => void;
  beforeOpen?: (this: TingleModal) => void;
  beforeClose?: (this: TingleModal) => boolean;
  stickyFooter?: boolean;
  footer?: boolean;
  cssClass?: string[];
  closeLabel?: string;
  closeMethods?: ('overlay' | 'button' | 'escape')[];
}

declare const tingle: {
  Modal: new (options?: TingleModalOptions) => TingleModal;
};

export default tingle;
