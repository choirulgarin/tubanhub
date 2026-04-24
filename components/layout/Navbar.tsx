'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

// Nav utama — ringkas untuk desktop.
const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/birokrasi', label: 'Birokrasi' },
  { href: '/wisata', label: 'Wisata' },
  { href: '/kuliner', label: 'Kuliner' },
  { href: '/jasa', label: 'Jasa' },
] as const;

// Link sekunder — hanya tampil di mobile sheet.
const SECONDARY_LINKS = [
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/pemerintah', label: 'Pemerintah Tuban' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/usul', label: 'Usulkan Tempat' },
  { href: '/pasang-iklan', label: 'Pasang Iklan' },
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
