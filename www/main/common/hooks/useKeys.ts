import { useEffect, useRef } from 'react';

/**
 * 'single': the key on its own. 'combination': the key with Ctrl (Cmd on
 * macOS).
 */
type ShortcutType = 'single' | 'combination';

export const useKeys = (
  key: string,
  shortcutType: ShortcutType,
  cb: (event: KeyboardEvent) => void,
) => {
  const callbackRef = useRef(cb);

  useEffect(() => {
    callbackRef.current = cb;
  });

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (!(event.target as Element).classList.contains('disable-kb-shortcuts')) {
        const defaultException = ['Space', 'ArrowUp', 'ArrowDown'];
        if (defaultException.includes(event.code)) {
          event.preventDefault();
        }

        if (shortcutType === 'single') {
          if (event.code === key) {
            callbackRef.current(event);
          }
        }
        if (shortcutType === 'combination') {
          if (event.code === key && (event.ctrlKey || event.metaKey)) {
            callbackRef.current(event);
          }
        }
      }
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [key]);
};
