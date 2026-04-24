'use client';

import { useEffect, useRef } from 'react';

type ViewTrackerProps = {
  itemId: string;
};

// Fire-and-forget POST untuk increment view_count.
// StrictMode di dev akan memanggil effect 2x — dihindari dengan ref guard.
export function ViewTracker({ itemId }: ViewTrackerProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!itemId) return;
    fired.current = true;

    // `keepalive` supaya request tetap jalan walau user langsung pindah halaman.
    fetch(`/api/items/${itemId}/view`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {
      // Silent — tracking tidak boleh mengganggu UX.
    });
  }, [itemId]);

  return null;
}
