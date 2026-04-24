import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, ExternalLink, Pin } from 'lucide-react';
import { getAnnouncementById } from '@/lib/queries';
import { formatDateTime } from '@/lib/utils/format';
import { RichContent } from '@/components/ui/RichContent';
import { AnnouncementCategoryBadge } from '@/components/AnnouncementCategoryBadge';

export const dynamic = 'force-dynamic';

type PageProps = { params: { id: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const a = await getAnnouncementById(params.id);
  if (!a) return { title: 'Pengumuman tidak ditemukan | TubanHub' };
  const desc = a.content
    ? a.content.replace(/[#*_\[\]`>]/g, '').slice(0, 160)
    : undefined;
  return {
    title: `${a.title} | Pengumuman TubanHub`,
    description: desc,
  };
}

export default async function PengumumanDetailPage({ params }: PageProps) {
  const a = await getAnnouncementById(params.id);
  if (!a) notFound();

  const date = a.published_at ?? a.created_at;

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <Link
        href="/pengumuman"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke semua pengumuman
      </Link>

      <header className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <AnnouncementCategoryBadge category={a.category} />
          {a.is_pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-900">
              <Pin className="h-2.5 w-2.5" aria-hidden />
              Penting
            </span>
          )}
          <span className="text-muted-foreground">
            Dipublikasikan {formatDateTime(date)}
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {a.title}
        </h1>

        {a.source && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Sumber:</span>
            {a.source_url ? (
              <a
                href={a.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {a.source}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : (
              <span className="font-medium text-foreground">{a.source}</span>
            )}
          </div>
        )}
      </header>

      {a.content ? (
        <div className="mt-8">
          <RichContent content={a.content} />
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          Tidak ada isi detail pengumuman ini.
        </p>
      )}

      {a.source_url && (
        <div className="mt-10 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <p className="mb-2 font-medium text-foreground">Sumber resmi</p>
          <a
            href={a.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 break-all text-primary hover:underline"
          >
            {a.source_url}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </a>
        </div>
      )}
    </article>
  );
}
