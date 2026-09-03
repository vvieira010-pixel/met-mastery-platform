import { useEffect } from 'react';

/**
 * Locks `document.body` scrolling while `active` is true.
 *
 * - Saves the prior `overflow` and `padding-right` and restores them on cleanup.
 * - Compensates for vertical-scrollbar width so the page does not jump left
 *   when the scrollbar disappears (common modal jank).
 *
 * Safe to mount/unmount repeatedly; idempotent within a render pass.
 *
 * @param {boolean} active  Whether the lock should be engaged right now.
 */
export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [active]);
}
