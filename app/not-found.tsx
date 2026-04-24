import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

// Halaman 404 global — ditampilkan ketika route/resource tidak ditemukan.
export const metadata = {
  title: '404 — Halaman tidak ditemukan | TubanHub',
  description: 'Halaman yang Anda cari tidak tersedia di TubanHub.',
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(50rem 30rem at 20% 20%, rgba(37,99,235,0.08), transparent), radial-gradient(40rem 25rem at 90% 80%, rgba(22,163,74,0.08), transparent)',
        }}
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <Logo href={null} />
        </div>

        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="h-8 w-8" aria-hidden />
        </div>

        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          Mungkin alamatnya salah ketik, atau halaman ini sudah dipindah.
          Coba kembali ke beranda atau cari yang Anda butuhkan.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <Home className="h-4 w-4" aria-hidden />
            Ke Beranda
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Search className="h-4 w-4" aria-hidden />
            Coba pencarian
          </Link>
        </div>
      </div>
    </div>
  );
}
