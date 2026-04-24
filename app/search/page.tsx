import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SearchX, MapPin, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchBar } from '@/components/search/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { searchItemsQuery } from '@/lib/queries';
import type { SearchResult } from '@/types';
import { getIcon } from '@/lib/icons';

// Dynamic karena bergantung pada query string.
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
      : 'Cari layanan birokrasi, destinasi wisata, kuliner, dan UMKM di Kabupaten Tuban.',
    robots: { index: false }, // halaman hasil tidak perlu di-index.
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? '';
  const results = q ? await searchItemsQuery(q) : [];

  // Group hasil by category slug — lebih informatif daripada list panjang.
  const grouped = groupByCategory(results);

  return (
    <>
      <PageHeader
        title="Pencarian"
        description="Cari layanan, destinasi wisata, kuliner, dan UMKM di Kabupaten Tuban."
        color="#7C3AED"
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: 'Pencarian' }]}
      />

      <section className="section">
        <div className="container-app space-y-8">
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
              description="Coba kata kunci lain, atau periksa ejaan. Anda juga bisa menjelajah langsung melalui kategori."
            />
          )}

          {q && results.length > 0 && (
            <>
              <p className="text-sm text-slate-600">
                Menemukan{' '}
                <span className="font-semibold text-slate-900">
                  {results.length}
                </span>{' '}
                hasil untuk{' '}
                <span className="font-semibold text-slate-900">“{q}”</span>
              </p>

              <div className="space-y-10">
                {grouped.map(([categorySlug, group]) => (
                  <GroupSection
                    key={categorySlug}
                    categorySlug={categorySlug}
                    items={group}
                  />
                ))}
              </div>
            </>
          )}
        </div>
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
  const color = first.category_color ?? '#2563EB';
  const Icon = getIcon(first.category_icon);

  return (
    <section>
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}1A`, color }}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-lg font-bold text-slate-900 md:text-xl">
            {first.category_name}
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({items.length})
            </span>
          </h2>
        </div>
        <Link
          href={`/${categorySlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Lihat semua →
        </Link>
      </header>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        {items.map((it) => (
          <li key={it.id}>
            <Link
              href={`/${it.category_slug}/${it.slug}`}
              className="flex items-start gap-4 p-4 transition hover:bg-slate-50 md:p-5"
            >
              {it.thumbnail_url ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl md:h-20 md:w-20">
                  <Image
                    src={it.thumbnail_url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  aria-hidden
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl md:h-20 md:w-20"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${color}33, ${color}14)`,
                  }}
                >
                  <MapPin
                    className="h-6 w-6"
                    style={{ color }}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {it.subcategory && (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${color}1A`, color }}
                    >
                      {it.subcategory}
                    </span>
                  )}
                  {it.is_verified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                      <CheckCircle className="h-3 w-3" aria-hidden />
                      Terverifikasi
                    </span>
                  )}
                </div>
                <h3 className="mt-1 text-base font-semibold text-slate-900 line-clamp-1">
                  {it.title}
                </h3>
                {it.description && (
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                    {it.description}
                  </p>
                )}
                {(it.district || it.address) && (
                  <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500">
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
