import React, { useEffect, useState } from 'react';
import { Dialog, PrimaryButton } from '@khalisfoundation/sikhi-ui';

type AppDialogOptions = {
  title: React.ReactNode;
  /** The content; a string is shown as a paragraph. */
  body?: React.ReactNode;
  /** The close button's label (default: Close). */
  closeLabel?: string;
  /** Extra class on the dialog, for its content's styles. */
  className?: string;
};

// The mounted host's setter; showAppDialog goes through it. A dialog asked
// for before the host mounts (e.g. at start) waits for it.
let openDialog: ((options: AppDialogOptions | null) => void) | null = null;
let pending: AppDialogOptions | null = null;

/**
 * Shows a message in a sikhi-ui dialog from anywhere in the main window
 * (code outside React, e.g. the notifications check). One at a time: a new
 * one replaces what's showing.
 */
export const showAppDialog = (options: AppDialogOptions) => {
  if (openDialog) {
    openDialog(options);
  } else {
    pending = options;
  }
};

/** The dialog showAppDialog opens. Mount once, in the main window. */
export const AppDialogHost = () => {
  const [options, setOptions] = useState<AppDialogOptions | null>(null);

  useEffect(() => {
    openDialog = setOptions;
    if (pending) {
      setOptions(pending);
      pending = null;
    }
    return () => {
      openDialog = null;
    };
  }, []);

  const close = () => setOptions(null);

  useEffect(() => {
    if (!options) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [options]);

  return (
    <Dialog
      isOpen={!!options}
      onClose={close}
      variant="gradient"
      className={`app-dialog ${options?.className ?? ''}`.trim()}
      headerLeft={<h2 className="app-dialog__title">{options?.title}</h2>}
    >
      {typeof options?.body === 'string' ? (
        <p className="app-dialog__text">{options.body}</p>
      ) : (
        options?.body
      )}
      <div className="app-dialog__actions">
        <PrimaryButton variant="outline" size="sm" onClick={close}>
          {options?.closeLabel ?? 'Close'}
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
