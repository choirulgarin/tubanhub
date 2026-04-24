'use client';

import { useEffect, useRef } from 'react';

export function EventViewTracker({ id }: { id: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const url = `/api/events/${id}/view`;
    try {
      if (typeof navigator.sendBeacon === 'function') {
        navigator.sendBeacon(url, new Blob([], { type: 'application/json' }));
      } else {
        fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
      }
    } catch {
      /* no-op */
    }
  }, [id]);
  return null;
}
