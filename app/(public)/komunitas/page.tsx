import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { CommunityCard } from '@/components/community/CommunityCard';
import { CommunityFilterBar } from '@/components/community/CommunityFilterBar';
import { getCommunities, type CommunityFilters } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Direktori Komunitas Tuban — Gabung Komunitas Lokal — TubanHub',
  description:
    'Temukan komunitas lokal Tuban: olahraga, seni, bisnis, sosial, dan teknologi. Semua jadwal kumpul & kontak dalam satu halaman.',
  alternates: { canonical: '/komunitas' },
};

export const revalidate = 300;

type SP = {
  category?: string;
  open?: string;
  sort?: string;
};

const VALID_SORTS = ['popular', 'members', 'newest', 'az'] as const;

export default async function KomunitasPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sort = VALID_SORTS.includes(searchParams.sort as (typeof VALID_SORTS)[number])
    ? (searchParams.sort as CommunityFilters['sort'])
    : 'popular';

  const filters: CommunityFilters = {
    category: searchParams.category,
    isOpen: searchParams.open === '1',
    sort,
  };

  const all = await getCommunities(filters);
  const featured = all.filter((c) => c.highlight_tier === 'featured');
  const rest = all.filter((c) => c.highlight_tier !== 'featured');

  return (
    <>
      <PageHeader
        title="Direktori Komunitas Tuban"
        description="Temukan dan gabung komunitas lokal Tuban — olahraga, seni, bisnis, sosial, dan lainnya."
        icon={Users}
        color="#0EA5E9"
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Komunitas' },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
        <CommunityFilterBar
          category={searchParams.category ?? ''}
          open={searchParams.open ?? ''}
          sort={searchParams.sort ?? 'popular'}
        />

        {featured.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                ⭐ Komunitas Pilihan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Komunitas unggulan pilihan TubanHub
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {featured.length > 0 && (
            <h2 className="text-lg font-semibold text-foreground">
              Semua Komunitas
            </h2>
          )}
          {rest.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Tidak ada komunitas yang cocok dengan filter.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((c) => (
                <CommunityCard key={c.id} community={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
