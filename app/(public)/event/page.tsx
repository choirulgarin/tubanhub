import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EventCard } from '@/components/event/EventCard';
import { EventFilterBar } from '@/components/event/EventFilterBar';
import { getEvents, getFeaturedEvents, type EventFilters } from '@/lib/queries';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Event & Agenda Tuban — Kalender Kegiatan Publik — TubanHub',
  description:
    'Agenda event, festival, workshop, dan kegiatan publik di Tuban. Cari event berdasarkan kategori, tanggal, dan komunitas penyelenggara.',
  alternates: { canonical: '/event' },
};

export const revalidate = 300;

type SP = {
  komunitas?: string;
  kategori?: string;
  category?: string;
  when?: string;
  harga?: string;
};

export default async function EventPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const timeframe: EventFilters['timeframe'] =
    searchParams.when === 'past' ? 'past' : 'upcoming';

  const priceFilter: EventFilters['priceFilter'] =
    searchParams.harga === 'free'
      ? 'free'
      : searchParams.harga === 'paid'
        ? 'paid'
        : undefined;

  const category = searchParams.category ?? searchParams.kategori ?? '';

  const filters: EventFilters = {
    category: category || undefined,
    timeframe,
    priceFilter,
  };

  const [events, featured] = await Promise.all([
    getEvents(filters),
    timeframe === 'upcoming' ? getFeaturedEvents(2) : Promise.resolve([]),
  ]);

  const featuredIds = new Set(featured.map((f) => f.id));
  const rest = events.filter((e) => !featuredIds.has(e.id));

  const upcomingQS = new URLSearchParams();
  if (category) upcomingQS.set('category', category);
  if (priceFilter) upcomingQS.set('harga', priceFilter);
  const upcomingHref = upcomingQS.toString()
    ? `/event?${upcomingQS.toString()}`
    : '/event';

  const pastQS = new URLSearchParams(upcomingQS);
  pastQS.set('when', 'past');
  const pastHref = `/event?${pastQS.toString()}`;

  return (
    <>
      <PageHeader
        title="Event & Agenda Tuban"
        description="Festival, workshop, meetup, dan kegiatan publik di Tuban. Jangan sampai ketinggalan."
        icon={CalendarDays}
        color="#F97316"
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Event' },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <nav className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
            <Link
              href={upcomingHref}
              className={cn(
                'rounded-md px-4 py-1.5 transition-colors',
                timeframe === 'upcoming'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Mendatang
            </Link>
            <Link
              href={pastHref}
              className={cn(
                'rounded-md px-4 py-1.5 transition-colors',
                timeframe === 'past'
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Sudah Lewat
            </Link>
          </nav>

          <EventFilterBar
            category={category}
            price={searchParams.harga ?? ''}
            className="md:w-auto md:min-w-[360px]"
          />
        </div>

        {featured.length > 0 && timeframe === 'upcoming' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                ⭐ Event Unggulan
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Event pilihan yang paling dinanti di Tuban
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featured.map((e) => (
                <EventCard key={e.id} event={e} size="lg" />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {featured.length > 0 && timeframe === 'upcoming' && (
            <h2 className="text-lg font-semibold text-foreground">
              Semua Event
            </h2>
          )}
          {rest.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              {timeframe === 'past'
                ? 'Belum ada event yang lewat.'
                : 'Belum ada event mendatang yang cocok dengan filter.'}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
