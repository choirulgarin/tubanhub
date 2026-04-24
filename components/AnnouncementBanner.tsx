'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Megaphone, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnnouncementCategory } from '@/types';

type Props = {
  id: string;
  title: string;
  category: AnnouncementCategory;
};

const BG_BY_CATEGORY: Record<AnnouncementCategory, string> = {
  umum: 'bg-slate-900 text-white',
  bencana: 'bg-red-600 text-white',
  kesehatan: 'bg-emerald-700 text-white',
  infrastruktur: 'bg-blue-700 text-white',
  event: 'bg-violet-700 text-white',
};

// Banner pengumuman aktif — dismissible per session (sessionStorage).
// Dismiss sengaja tidak persistent agar user tetap lihat update tiap buka
// tab/PWA baru, tapi tidak annoying saat navigasi internal.
export function AnnouncementBanner({ id, title, category }: Props) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`announcement-dismissed:${id}`);
      setDismissed(stored === '1');
    } catch {
      setDismissed(false);
    }
  }, [id]);

  if (dismissed !== false) return null;

  function handleDismiss() {
    try {
      sessionStorage.setItem(`announcement-dismissed:${id}`, '1');
    } catch {
      /* no-op */
    }
    setDismissed(true);
  }

  return (
    <div
      role="status"
      className={cn('relative', BG_BY_CATEGORY[category])}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5">
        <Megaphone className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        <Link
          href={`/pengumuman/${id}`}
          className="flex flex-1 items-center gap-2 text-sm hover:underline"
        >
          <span className="line-clamp-1 font-medium">{title}</span>
          <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 opacity-80 sm:inline" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup pengumuman"
          className="shrink-0 rounded-md p-1 transition-colors hover:bg-white/15"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
