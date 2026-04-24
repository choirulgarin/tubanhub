'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Tag,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type AdminSidebarProps = {
  email: string | null;
};

const NAV_ITEMS = [
  { href: '/admin/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/items',      label: 'Semua Item',  icon: List },
  { href: '/admin/items/new',  label: 'Tambah Baru', icon: PlusCircle },
  { href: '/admin/categories', label: 'Kategori',    icon: Tag,          placeholder: true },
] as const;

function isActive(href: string, pathname: string) {
  // /admin/items harus match persis, jangan sampai /admin/items/new ikut active.
  if (href === '/admin/items') {
    return pathname === '/admin/items' || pathname.startsWith('/admin/items/');
  }
  if (href === '/admin/items/new') {
    return pathname === '/admin/items/new';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export function AdminSidebar({ email }: AdminSidebarProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  const nav = (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, pathname);
        // Khusus "Semua Item" — aktif bila di /admin/items tapi bukan /new.
        const realActive =
          item.href === '/admin/items'
            ? pathname === '/admin/items' || (pathname.startsWith('/admin/items/') && !pathname.startsWith('/admin/items/new'))
            : item.href === '/admin/items/new'
            ? pathname === '/admin/items/new'
            : active;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              realActive
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
            aria-current={realActive ? 'page' : undefined}
          >
            {realActive && (
              <span
                aria-hidden
                className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
              />
            )}
            <Icon className="h-4 w-4" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {'placeholder' in item && item.placeholder && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-slate-500">
                soon
              </span>
            )}
          </Link>
        );
      })}

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        <span className="flex-1">Lihat Website</span>
      </Link>
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-100 p-3">
      {email && (
        <div className="mb-2 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Masuk sebagai
          </p>
          <p className="truncate text-sm font-medium text-slate-800" title={email}>
            {email}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        {loggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden />
        )}
        Keluar
      </button>
    </div>
  );

  return (
    <>
      {/* Top bar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Logo href="/admin/dashboard" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
          aria-label="Buka menu admin"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-4">
          <Logo href="/admin/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <Logo href="/admin/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                aria-label="Tutup menu admin"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
