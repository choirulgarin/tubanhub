'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  MessageSquarePlus,
  Megaphone,
  Sparkles,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type AdminSidebarProps = {
  email: string | null;
  pendingSuggestions?: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'pendingSuggestions';
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/items', label: 'Semua Item', icon: List },
  { href: '/admin/items/new', label: 'Tambah Baru', icon: PlusCircle },
  {
    href: '/admin/suggestions',
    label: 'Usulan',
    icon: MessageSquarePlus,
    badgeKey: 'pendingSuggestions',
  },
  { href: '/admin/announcements', label: 'Pengumuman', icon: Megaphone },
  { href: '/admin/ads', label: 'Iklan', icon: Sparkles },
];

function isActive(href: string, pathname: string) {
  if (href === '/admin/items') {
    return (
      pathname === '/admin/items' ||
      (pathname.startsWith('/admin/items/') &&
        !pathname.startsWith('/admin/items/new'))
    );
  }
  if (href === '/admin/items/new') {
    return pathname === '/admin/items/new';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

export function AdminSidebar({
  email,
  pendingSuggestions = 0,
}: AdminSidebarProps) {
  const badges = { pendingSuggestions } as const;
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
    <nav aria-label="Navigasi admin" className="flex flex-col gap-0.5 p-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, pathname);
        const badge = item.badgeKey ? badges[item.badgeKey] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span
                aria-label={`${badge} item menunggu`}
                className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground"
              >
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </Link>
        );
      })}

      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <span>Lihat Website</span>
      </Link>
    </nav>
  );

  const footer = (
    <div className="border-t border-border p-3">
      {email && (
        <div className="mb-2 px-3 py-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Masuk sebagai
          </p>
          <p className="truncate text-xs font-medium text-foreground" title={email}>
            {email}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:opacity-60"
      >
        {loggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        )}
        Keluar
      </button>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <Logo href="/admin/dashboard" />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md border border-border p-2 text-foreground hover:bg-muted"
          aria-label="Buka menu admin"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[220px] flex-col border-r border-border bg-background md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Logo href="/admin/dashboard" />
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        {footer}
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <Logo href="/admin/dashboard" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
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
