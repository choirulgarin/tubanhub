'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';

// Root error boundary — menangkap error di segment manapun.
// Wajib 'use client' karena menerima callback `reset`.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Di produksi ini akan ter-capture oleh Sentry/Vercel Logs via console.error.
    console.error('[RootError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" aria-hidden />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Terjadi kesalahan
        </h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          Maaf, ada masalah saat memuat halaman ini. Coba lagi atau kembali
          ke beranda.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">
            Kode referensi: <code>{error.digest}</code>
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            Coba lagi
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Home className="h-4 w-4" aria-hidden />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
