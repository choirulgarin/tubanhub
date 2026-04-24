import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '404 — Halaman tidak ditemukan | TubanHub',
  description: 'Halaman yang Anda cari tidak tersedia di TubanHub.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <Logo href={null} />
        </div>

        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
          <Compass className="h-6 w-6" strokeWidth={1.5} aria-hidden />
        </div>

        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Mungkin alamatnya salah ketik, atau halaman ini sudah dipindah.
          Coba kembali ke beranda atau cari yang Anda butuhkan.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" aria-hidden />
              Ke Beranda
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="h-4 w-4" aria-hidden />
              Coba pencarian
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
