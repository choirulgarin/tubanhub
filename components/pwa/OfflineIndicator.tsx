'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

// Banner kuning di atas layar saat user kehilangan koneksi.
// Memakai `navigator.onLine` + event online/offline.
export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Pakai navigator.onLine sebagai state awal (bisa salah di beberapa browser,
    // tapi event online/offline akan mengoreksi jika kondisinya berubah).
    setOffline(!navigator.onLine);

    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 shadow-sm"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      <span>Kamu sedang offline. Beberapa fitur mungkin tidak tersedia.</span>
    </div>
  );
}
