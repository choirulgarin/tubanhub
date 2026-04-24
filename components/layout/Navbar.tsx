'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Building2,
  MapPin,
  Menu,
  Search,
  Home,
  Info,
  MessageSquarePlus,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

// Konfigurasi nav link — dipakai baik untuk desktop maupun mobile sheet.
const NAV_LINKS = [
  { href: '/',          label: 'Beranda',   icon: Home },
  { href: '/birokrasi', label: 'Birokrasi', icon: Building2 },
  { href: '/wisata',    label: 'Wisata',    icon: MapPin },
] as const;

// Link sekunder — hanya tampil di mobile sheet untuk menjaga desktop nav tetap ringkas.
const SECONDARY_LINKS = [
  { href: '/tentang', label: 'Tentang',        icon: Info },
  { href: '/usul',    label: 'Usulkan Tempat', icon: MessageSquarePlus },
] as const;

// Cek apakah sebuah path match dengan pathname saat ini.
// "/" hanya match persis; selain itu match jika pathname-nya sama atau diawali prefix + "/".
function isActive(href: string, pathname: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tambah subtle shadow saat user scroll ke bawah.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sembunyikan navbar di area admin — admin punya layout & sidebar sendiri.
  if (pathname?.startsWith('/admin')) return null;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b border-border/80 bg-white/95 backdrop-blur transition-shadow',
        scrolled && 'shadow-sm',
      )}
    >
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo />

        {/* Desktop nav */}
        <nav aria-label="Navigasi utama" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname ?? '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-slate-600 hover:text-primary hover:bg-primary-light/50',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cari"
            onClick={() => router.push('/search')}
            className="text-slate-600 hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            {/* base-ui pakai prop `render` (bukan `asChild` ala Radix). */}
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Buka menu"
                  className="md:hidden text-slate-600"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              <div className="flex flex-col gap-6">
                <Logo />

                <nav aria-label="Navigasi mobile" className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href, pathname ?? '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary-light text-primary'
                            : 'text-slate-700 hover:bg-slate-100',
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
                        {label}
                      </Link>
                    );
                  })}

                  <hr className="my-2 border-slate-200" />

                  {SECONDARY_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href, pathname ?? '/');
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary-light text-primary'
                            : 'text-slate-600 hover:bg-slate-100',
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden />
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
