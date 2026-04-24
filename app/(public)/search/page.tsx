import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SearchX, MapPin, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/separator';
import { searchItemsQuery } from '@/lib/queries';
import type { SearchResult } from '@/types';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: { q?: string };
};

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = searchParams.q?.trim() ?? '';
  return {
    title: q ? `Hasil "${q}" — TubanHub` : 'Cari — TubanHub',
    description: q
      ? `Hasil pencarian untuk "${q}" di TubanHub.`
      : 'Cari layanan, destinasi, kuliner, dan UMKM di Kabupaten Tuban.',
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? '';
  const results = q ? await searchItemsQuery(q) : [];
  const grouped = groupByCategory(results);

  return (
    <>
      <PageHeader
        title="Pencarian"
        description="Cari layanan, destinasi, kuliner, dan UMKM di Kabupaten Tuban."
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: 'Pencarian' }]}
      />

      <section className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
        <SearchBar defaultValue={q} autoFocus={!q} liveNavigate />

        {!q && (
          <EmptyState
            icon={SearchX}
            title="Mulai mengetik untuk mencari"
            description="Coba cari nama layanan, destinasi, atau kelurahan — misalnya: KTP, Goa Akbar, atau Semanding."
          />
        )}

        {q && results.length === 0 && (
          <EmptyState
            icon={SearchX}
            title={`Tidak ada hasil untuk "${q}"`}
            description="Coba kata kunci lain, atau periksa ejaan. Kamu juga bisa menjelajah lewat kategori."
          />
        )}

        {q && results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              Menemukan{' '}
              <span className="font-medium text-foreground">
                {results.length}
              </span>{' '}
              hasil untuk{' '}
              <span className="font-medium text-foreground">“{q}”</span>
            </p>

            <div className="space-y-10">
              {grouped.map(([categorySlug, group], i) => (
                <div key={categorySlug}>
                  {i > 0 && <Separator className="mb-10" />}
                  <GroupSection categorySlug={categorySlug} items={group} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function groupByCategory(
  results: SearchResult[],
): Array<[string, SearchResult[]]> {
  const map = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = r.category_slug;
    const list = map.get(key) ?? [];
    list.push(r);
    map.set(key, list);
  }
  return Array.from(map.entries());
}

function GroupSection({
  categorySlug,
  items,
}: {
  categorySlug: string;
  items: SearchResult[];
}) {
  const first = items[0];

  return (
    <section>
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {first.category_name}{' '}
          <span className="ml-1 text-muted-foreground/70">
            ({items.length})
          </span>
        </h2>
        <Link
          href={`/${categorySlug}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Lihat semua →
        </Link>
      </header>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {items.map((it) => (
          <li key={it.id}>
            <Link
              href={`/${it.category_slug}/${it.slug}`}
              className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/40"
            >
              {it.thumbnail_url ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={it.thumbnail_url}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                  <MapPin className="h-5 w-5" strokeWidth={1.5} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {it.subcategory && (
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                      {it.subcategory}
                    </span>
                  )}
                  {it.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3" aria-hidden />
                      Terverifikasi
                    </span>
                  )}
                </div>
                <h3 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
                  {it.title}
                </h3>
                {it.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {it.description}
                  </p>
                )}
                {(it.district || it.address) && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {it.district ?? it.address}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
