import Link from 'next/link';
import type { Metadata } from 'next';
import { Megaphone, Pin, ArrowRight } from 'lucide-react';
import { getAnnouncements } from '@/lib/queries';
import { formatDate } from '@/lib/utils/format';
import { truncateText } from '@/lib/utils/format';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ANNOUNCEMENT_CATEGORY_LABEL,
  AnnouncementCategoryBadge,
} from '@/components/AnnouncementCategoryBadge';
import type { Announcement } from '@/types';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Pengumuman & Berita Penting | TubanHub',
  description:
    'Info terkini seputar Tuban — pengumuman pemerintah, bencana, kesehatan, infrastruktur, dan event daerah.',
};

export default async function PengumumanPage() {
  const items = await getAnnouncements();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <Megaphone className="h-3.5 w-3.5" aria-hidden />
          Pusat Informasi Tuban
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Pengumuman & Berita Penting
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Info terkini seputar kondisi dan kebijakan di Tuban —
          disiarkan oleh tim TubanHub.
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Saat ini tidak ada pengumuman aktif. Silakan cek lagi nanti."
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </main>
  );
}

function AnnouncementCard({ a }: { a: Announcement }) {
  const date = a.published_at ?? a.created_at;
  const preview = a.content ? truncateText(a.content, 180) : null;
  return (
    <Link
      href={`/pengumuman/${a.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <AnnouncementCategoryBadge category={a.category} />
        {a.is_pinned && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">
            <Pin className="h-2.5 w-2.5" aria-hidden />
            Penting
          </span>
        )}
        <span className="text-muted-foreground">{formatDate(date, 'long')}</span>
      </div>

      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
        {a.title}
      </h2>

      {preview && (
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {preview}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between text-xs">
        {a.source ? (
          <span className="text-muted-foreground">Sumber: {a.source}</span>
        ) : (
          <span className="text-muted-foreground">
            {ANNOUNCEMENT_CATEGORY_LABEL[a.category]}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
          Baca selengkapnya
          <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
