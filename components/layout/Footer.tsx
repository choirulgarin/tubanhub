import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';

// Icon sosmed — inline SVG karena lucide-react v1.x menghapus logo brand
// (Instagram/Facebook) karena alasan trademark. Path resmi dari brand guidelines.
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.17.05 1.8.25 2.22.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.37 1.05.42 2.22.06 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.17-.25 1.8-.42 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.05.37-2.22.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.17-.05-1.8-.25-2.22-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.37-1.05-.42-2.22C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.17.25-1.8.42-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.05-.37 2.22-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.16 0-3.53 0-4.72.06-1.1.05-1.7.24-2.1.4-.53.2-.9.46-1.3.85-.4.4-.65.77-.85 1.3-.16.4-.35 1-.4 2.1C2.56 8.47 2.56 8.84 2.56 12s0 3.53.06 4.72c.05 1.1.24 1.7.4 2.1.2.53.46.9.85 1.3.4.4.77.65 1.3.85.4.16 1 .35 2.1.4 1.2.06 1.56.06 4.72.06s3.53 0 4.72-.06c1.1-.05 1.7-.24 2.1-.4a3 3 0 0 0 1.3-.85c.4-.4.65-.77.85-1.3.16-.4.35-1 .4-2.1.06-1.2.06-1.56.06-4.72s0-3.53-.06-4.72c-.05-1.1-.24-1.7-.4-2.1a3 3 0 0 0-.85-1.3 3 3 0 0 0-1.3-.85c-.4-.16-1-.35-2.1-.4C15.53 4 15.16 4 12 4Zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88Zm0 8.14a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm6.3-8.37a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21.95V13.5h2.85l.43-3.3H13.5V8.08c0-.96.26-1.6 1.63-1.6h1.74V3.52a23 23 0 0 0-2.53-.13c-2.5 0-4.22 1.53-4.22 4.33v2.43H7.25v3.3h2.87v8.45a10 10 0 1 0 3.38 0Z" />
    </svg>
  );
}

// Footer global — ditampilkan di semua halaman kecuali /admin.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-slate-900 text-slate-200">
      <div className="container-app py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Kolom 1 — Brand */}
          <div className="space-y-3">
            <Logo variant="white" href={null} />
            <p className="text-sm font-medium text-white">
              Semua tentang Tuban, dalam satu genggaman.
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              Platform informasi terpadu yang menghubungkan warga dan wisatawan
              dengan layanan pemerintah, destinasi wisata, kuliner, dan jasa lokal
              di Kabupaten Tuban.
            </p>
          </div>

          {/* Kolom 2 — Kategori */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Kategori
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/birokrasi" className="text-slate-300 hover:text-white">
                  Birokrasi &amp; Layanan
                </Link>
              </li>
              <li>
                <Link href="/wisata" className="text-slate-300 hover:text-white">
                  Wisata
                </Link>
              </li>
              <li>
                <Link href="/kuliner" className="text-slate-300 hover:text-white">
                  Kuliner
                </Link>
              </li>
              <li>
                <Link href="/jasa" className="text-slate-300 hover:text-white">
                  Jasa &amp; Layanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3 — Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              TubanHub
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/tentang" className="text-slate-300 hover:text-white">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/usulkan" className="text-slate-300 hover:text-white">
                  Usulkan Tempat
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-slate-300 hover:text-white">
                  Hubungi Kami
                </Link>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram TubanHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <IconInstagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook TubanHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <IconFacebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-slate-700 pt-6 text-xs text-slate-400 md:flex-row md:items-center">
          <p className="inline-flex items-center gap-1.5">
            © {year} TubanHub. Dibuat dengan{' '}
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" aria-hidden />{' '}
            untuk warga Tuban.
          </p>
          <p>Data bersumber dari informasi publik yang tersedia.</p>
        </div>
      </div>
    </footer>
  );
}
