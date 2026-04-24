import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { InfluencerCard } from '@/components/influencer/InfluencerCard';
import { InfluencerFilterBar } from '@/components/influencer/InfluencerFilterBar';
import { getInfluencers, type InfluencerFilters } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Direktori Influencer Tuban — Content Creator Lokal — TubanHub',
  description:
    'Temukan content creator dan influencer lokal Tuban untuk promosi bisnis kamu. Rate card transparan, niche beragam, khusus pasar Tuban.',
  alternates: { canonical: '/influencer' },
};

export const revalidate = 300;

type SP = {
  niche?: string;
  platform?: string;
  budget?: string;
  sort?: string;
};

export default async function InfluencerPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const filters: InfluencerFilters = {
    niche: searchParams.niche,
    platform: searchParams.platform,
    budget:
      searchParams.budget === 'low' ||
      searchParams.budget === 'mid' ||
      searchParams.budget === 'high'
        ? searchParams.budget
        : undefined,
    sort:
      searchParams.sort === 'followers' ||
      searchParams.sort === 'cheapest' ||
      searchParams.sort === 'popular'
        ? searchParams.sort
        : 'popular',
  };

  const all = await getInfluencers(filters);
  const featured = all.filter((i) => i.highlight_tier === 'featured');
  const rest = all.filter((i) => i.highlight_tier !== 'featured');

  return (
    <>
      <PageHeader
        title="Direktori Influencer Tuban"
        description="Temukan content creator dan influencer lokal Tuban untuk promosi bisnis kamu."
        icon={Star}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Influencer' },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
        <InfluencerFilterBar
          niche={searchParams.niche ?? ''}
          platform={searchParams.platform ?? ''}
          budget={searchParams.budget ?? ''}
          sort={searchParams.sort ?? 'popular'}
        />

        {featured.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                ⭐ Featured Creators
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Creator unggulan pilihan TubanHub
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((inf) => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {featured.length > 0 && (
            <h2 className="text-lg font-semibold text-foreground">
              Semua Influencer
            </h2>
          )}
          {rest.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Tidak ada influencer yang cocok dengan filter.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((inf) => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
