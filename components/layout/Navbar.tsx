'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

// Nav utama — ringkas untuk desktop. Kategori di-group di bawah Direktori.
const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
] as const;

const DIRECTORY_LINKS = [
  { href: '/birokrasi', label: 'Birokrasi', desc: 'Layanan pemerintah & administrasi' },
  { href: '/wisata', label: 'Wisata', desc: 'Destinasi & tempat wisata Tuban' },
  { href: '/kuliner', label: 'Kuliner', desc: 'Makanan khas & tempat makan' },
  { href: '/jasa', label: 'Jasa', desc: 'Layanan umum lokal' },
  { href: '/influencer', label: 'Influencer', desc: 'Content creator & endorse lokal' },
  { href: '/komunitas', label: 'Komunitas', desc: 'Komunitas lokal & kegiatan rutin' },
  { href: '/event', label: 'Event', desc: 'Agenda & festival di Tuban' },
] as const;

const DIRECTORY_PATHS = DIRECTORY_LINKS.map((l) => l.href);

const EXTRA_DESKTOP_LINKS = [
  { href: '/harga', label: 'Harga' },
] as const;

// Link sekunder — hanya tampil di mobile sheet.
const SECONDARY_LINKS = [
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/pemerintah', label: 'Pemerintah Tuban' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/usul', label: 'Usulkan Tempat' },
  { href: '/harga', label: 'Harga' },
  { href: '/pasang-iklan', label: 'Pasang Iklan' },
  { href: '/klaim', label: 'Klaim Listing' },
  { href: '/kontak', label: 'Hubungi Kami' },
] as const;

function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dirOpen, setDirOpen] = useState(false);
  const dirRef = useRef<HTMLDivElement | null>(null);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    if (!dirOpen) return;
    function onPointer(e: PointerEvent) {
      if (!dirRef.current?.contains(e.target as Node)) {
        setDirOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDirOpen(false);
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [dirOpen]);

  // Tutup dropdown saat path berubah.
  useEffect(() => {
    setDirOpen(false);
  }, [pathname]);

  const dirActive = DIRECTORY_PATHS.some((p) => isActive(p, pathname ?? '/'));

  // Sembunyikan navbar di area admin.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        {/* Desktop nav */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href, pathname ?? '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}

          {/* Direktori dropdown */}
          <div ref={dirRef} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={dirOpen}
              onClick={() => setDirOpen((v) => !v)}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors',
                dirActive
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Direktori
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  dirOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>

            {dirOpen && (
              <div
                role="menu"
                className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-md"
              >
                {DIRECTORY_LINKS.map(({ href, label, desc }) => {
                  const active = isActive(href, pathname ?? '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setDirOpen(false)}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-sm transition-colors',
                        active
                          ? 'bg-muted text-foreground'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <span className="block font-medium">{label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {desc}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {EXTRA_DESKTOP_LINKS.map(({ href, label }) => {
            const active = isActive(href, pathname ?? '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cari"
            onClick={() => router.push('/search')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Search />
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Buka menu"
                  className="text-muted-foreground hover:text-foreground md:hidden"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              <div className="flex flex-col gap-6 pt-2">
                <Logo />

                <nav
                  aria-label="Navigasi mobile"
                  className="flex flex-col gap-0.5"
                >
                  {NAV_LINKS.map(({ href, label }) => {
                    const active = isActive(href, pathname ?? '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}

                  <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Direktori
                  </p>
                  {DIRECTORY_LINKS.map(({ href, label }) => {
                    const active = isActive(href, pathname ?? '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}

                  <div className="my-3 h-px bg-border" />

                  {SECONDARY_LINKS.map(({ href, label }) => {
                    const active = isActive(href, pathname ?? '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'rounded-md px-3 py-2 text-sm transition-colors',
                          active
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
