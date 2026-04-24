import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  CalendarDays,
  MapPin,
  Ticket,
  Users,
  Clock,
  Globe,
  ExternalLink,
  Video,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { RichContent } from '@/components/ui/RichContent';
import { EventViewTracker } from '@/components/event/ViewTracker';
import { ShareCard } from '@/components/event/ShareCard';
import { getEventBySlug, getEventSlugs } from '@/lib/queries';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from '@/lib/utils/format';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const e = await getEventBySlug(params.slug);
  if (!e) return { title: 'Event tidak ditemukan — TubanHub' };
  return {
    title: `${e.title} — Event Tuban — TubanHub`,
    description:
      e.tagline ?? e.description?.slice(0, 160) ?? `Event ${e.title} di Tuban`,
    alternates: { canonical: `/event/${e.slug}` },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  umum: 'Umum',
  olahraga: 'Olahraga',
  bisnis: 'Bisnis',
  sosial: 'Sosial',
  'seni-budaya': 'Seni & Budaya',
  keagamaan: 'Keagamaan',
  pendidikan: 'Pendidikan',
  teknologi: 'Teknologi',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  umum: 'from-slate-400 to-slate-600',
  olahraga: 'from-emerald-500 to-teal-700',
  bisnis: 'from-amber-500 to-orange-600',
  sosial: 'from-rose-500 to-pink-700',
  'seni-budaya': 'from-violet-500 to-fuchsia-700',
  keagamaan: 'from-sky-500 to-indigo-700',
  pendidikan: 'from-blue-500 to-cyan-700',
  teknologi: 'from-neutral-700 to-neutral-900',
};

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const e = await getEventBySlug(params.slug);
  if (!e) notFound();

  const gradient =
    CATEGORY_GRADIENT[e.category] ?? CATEGORY_GRADIENT.umum;
  const isFree = e.ticket_price === 0;
  const startedAt = new Date(e.start_date);
  const isPast = startedAt.getTime() < Date.now();
  const deadlinePast = e.registration_deadline
    ? new Date(e.registration_deadline).getTime() < Date.now()
    : false;

  return (
    <>
      <EventViewTracker id={e.id} />
      <PageHeader
        title={e.title}
        description={e.tagline ?? undefined}
        icon={CalendarDays}
        color="#F97316"
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Event', href: '/event' },
          { label: e.title },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="relative mb-8 aspect-[16/7] w-full overflow-hidden rounded-xl">
          {e.cover_url ? (
            <Image
              src={e.cover_url}
              alt={e.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-white`}
            >
              <CalendarDays
                className="h-20 w-20 opacity-30"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          )}
          {isPast && (
            <div className="absolute left-4 top-4 rounded-full bg-neutral-800/85 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Event Berakhir
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {CATEGORY_LABEL[e.category] ?? e.category}
                </span>
                {e.is_online && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Video className="h-3 w-3" aria-hidden />
                    Online
                  </span>
                )}
                {isFree && !isPast && (
                  <span className="inline-flex items-center rounded-full bg-green-600 px-2 py-0.5 text-xs font-medium text-white">
                    GRATIS
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-foreground">
                {e.title}
              </h2>
            </div>

            <dl className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Waktu
                </dt>
                <dd className="mt-1 inline-flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                  {formatDateTime(e.start_date)}
                </dd>
                {e.end_date && (
                  <dd className="mt-1 text-xs text-muted-foreground">
                    s/d {formatDateTime(e.end_date)}
                  </dd>
                )}
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lokasi
                </dt>
                <dd className="mt-1 inline-flex items-start gap-2 text-sm text-foreground">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span>
                    {e.location_name ?? (e.is_online ? 'Online' : '—')}
                    {e.location_address && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {e.location_address}
                      </span>
                    )}
                  </span>
                </dd>
              </div>
              {e.organizer_name && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Penyelenggara
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {e.organizer_name}
                  </dd>
                </div>
              )}
              {e.max_attendees && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Kapasitas
                  </dt>
                  <dd className="mt-1 inline-flex items-center gap-2 text-sm text-foreground">
                    <Users
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden
                    />
                    {e.current_attendees}/{e.max_attendees} peserta
                  </dd>
                </div>
              )}
            </dl>

            {e.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Ringkasan
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {e.description}
                </p>
              </div>
            )}

            {e.content && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Detail Event
                </h3>
                <div className="mt-3">
                  <RichContent content={e.content} />
                </div>
              </div>
            )}

            {e.community && (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Diselenggarakan oleh komunitas
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {e.community.logo_url ? (
                      <Image
                        src={e.community.logo_url}
                        alt={e.community.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-base font-semibold text-muted-foreground">
                        {e.community.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {e.community.name}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/komunitas/${e.community.slug}`}>
                      Lihat profil
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Tiket</h3>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {isFree ? 'Gratis' : formatCurrency(e.ticket_price)}
              </p>
              {e.ticket_note && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.ticket_note}
                </p>
              )}

              {e.registration_deadline && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Pendaftaran ditutup:{' '}
                  <span className="font-medium text-foreground">
                    {formatDate(e.registration_deadline)}
                  </span>
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                {!isPast && e.registration_url && !deadlinePast && (
                  <Button asChild>
                    <a
                      href={e.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Ticket className="h-4 w-4" aria-hidden />
                      Daftar Sekarang
                    </a>
                  </Button>
                )}
                {e.is_online && e.online_url && !isPast && (
                  <Button asChild variant="outline">
                    <a
                      href={e.online_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Video className="h-4 w-4" aria-hidden />
                      Link Online
                    </a>
                  </Button>
                )}
                {e.gmaps_url && (
                  <Button asChild variant="outline">
                    <a
                      href={e.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4" aria-hidden />
                      Buka Maps
                    </a>
                  </Button>
                )}
                {e.organizer_contact && (
                  <Button asChild variant="outline">
                    <a
                      href={
                        e.organizer_contact.startsWith('http')
                          ? e.organizer_contact
                          : `https://wa.me/${e.organizer_contact.replace(/\D/g, '')}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden />
                      Kontak Penyelenggara
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <ShareCard title={e.title} slug={e.slug} />

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Info</h3>
              <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                {e.district && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" aria-hidden />
                    <span>Kecamatan: {e.district}</span>
                  </div>
                )}
                <div className="text-xs">
                  {e.view_count.toLocaleString('id-ID')} views
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
