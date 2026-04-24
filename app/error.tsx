'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[RootError]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-destructive/30 bg-card text-destructive">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Terjadi kesalahan
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Maaf, ada masalah saat memuat halaman ini. Coba lagi atau kembali
          ke beranda.
        </p>

        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Kode referensi: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button type="button" onClick={reset}>
            <RotateCw className="h-4 w-4" aria-hidden />
            Coba lagi
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden />
              Ke Beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
