import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';

// Footer publik — minimalis, monokrom gelap, tanpa icon sosmed.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-foreground text-white/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Logo variant="white" href={null} />
            <p className="text-sm leading-relaxed text-white/60">
              Platform informasi terpadu untuk warga dan wisatawan Tuban,
              Jawa Timur.
            </p>
          </div>

          {/* Kategori */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              Kategori
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/birokrasi" className="text-white/60 transition-colors hover:text-white">
                  Birokrasi
                </Link>
              </li>
              <li>
                <Link href="/wisata" className="text-white/60 transition-colors hover:text-white">
                  Wisata
                </Link>
              </li>
              <li>
                <Link href="/kuliner" className="text-white/60 transition-colors hover:text-white">
                  Kuliner
                </Link>
              </li>
              <li>
                <Link href="/jasa" className="text-white/60 transition-colors hover:text-white">
                  Jasa
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
              TubanHub
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/tentang" className="text-white/60 transition-colors hover:text-white">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/usul" className="text-white/60 transition-colors hover:text-white">
                  Usulkan Tempat
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="text-white/60 transition-colors hover:text-white">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <p>© {year} TubanHub. Dibuat untuk warga Tuban.</p>
          <p>Data bersumber dari informasi publik yang tersedia.</p>
        </div>
      </div>
    </footer>
  );
}
