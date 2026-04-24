import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  BadgeCheck,
  Users,
  CalendarClock,
  CalendarDays,
  MessageSquare,
  Mail,
  Globe,
  ExternalLink,
  Sparkles,
  DoorOpen,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { CommunityViewTracker } from '@/components/community/ViewTracker';
import { EventCard } from '@/components/event/EventCard';
import {
  getCommunityBySlug,
  getCommunitySlugs,
  getEventsByCommunity,
} from '@/lib/queries';
import { formatNumber } from '@/lib/utils/format';
import type { EventWithCommunity } from '@/types';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getCommunitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await getCommunityBySlug(params.slug);
  if (!c) return { title: 'Komunitas tidak ditemukan — TubanHub' };
  return {
    title: `${c.name} — Komunitas Tuban — TubanHub`,
    description: c.tagline ?? c.description?.slice(0, 160) ?? `Komunitas ${c.name} di Tuban`,
    alternates: { canonical: `/komunitas/${c.slug}` },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  olahraga: 'Olahraga',
  'seni-budaya': 'Seni & Budaya',
  'bisnis-umkm': 'Bisnis & UMKM',
  'sosial-lingkungan': 'Sosial & Lingkungan',
  'teknologi-kreatif': 'Teknologi & Kreatif',
  pendidikan: 'Pendidikan',
  hobi: 'Hobi',
  keagamaan: 'Keagamaan',
  umum: 'Umum',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  olahraga: 'from-emerald-500 to-teal-700',
  'seni-budaya': 'from-violet-500 to-fuchsia-700',
  'bisnis-umkm': 'from-amber-500 to-orange-600',
  'sosial-lingkungan': 'from-rose-500 to-pink-700',
  'teknologi-kreatif': 'from-neutral-700 to-neutral-900',
  pendidikan: 'from-blue-500 to-cyan-700',
  hobi: 'from-sky-400 to-blue-600',
  keagamaan: 'from-indigo-500 to-violet-700',
  umum: 'from-slate-400 to-slate-600',
};

function sanitizeWa(v: string) {
  return v.replace(/[^0-9]/g, '');
}

export default async function KomunitasDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const c = await getCommunityBySlug(params.slug);
  if (!c) notFound();

  const events: EventWithCommunity[] = (await getEventsByCommunity(c.id, 3)).map(
    (e) => ({ ...e, community: { id: c.id, name: c.name, slug: c.slug, logo_url: c.logo_url } }),
  );
  const gradient = CATEGORY_GRADIENT[c.category] ?? CATEGORY_GRADIENT.umum;
  const tier = c.highlight_tier;

  return (
    <>
      <CommunityViewTracker id={c.id} />
      <PageHeader
        title={c.name}
        description={c.tagline ?? undefined}
        icon={Users}
        color="#0EA5E9"
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Komunitas', href: '/komunitas' },
          { label: c.name },
        ]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="relative mb-8 aspect-[3/1] w-full overflow-hidden rounded-xl">
          {c.cover_url ? (
            <Image
              src={c.cover_url}
              alt={c.name}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          ) : (
            <div
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} text-white`}
            >
              <Users className="h-16 w-16 opacity-30" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                {c.logo_url ? (
                  <Image
                    src={c.logo_url}
                    alt={c.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                    {c.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {c.name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </span>
                  {tier === 'featured' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-medium text-white">
                      <Sparkles className="h-3 w-3" aria-hidden />
                      Featured
                    </span>
                  )}
                  {tier === 'highlight' && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      Unggulan
                    </span>
                  )}
                  {c.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Verified
                    </span>
                  )}
                  {c.is_open && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                      <DoorOpen className="h-3 w-3" aria-hidden />
                      Terbuka
                    </span>
                  )}
                </div>
              </div>
            </div>

            {c.description && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Tentang
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              </div>
            )}

            {(c.meeting_place || c.meeting_schedule) && (
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Jadwal Kumpul
                </h3>
                <dl className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {c.meeting_schedule && (
                    <div className="inline-flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" aria-hidden />
                      <span>{c.meeting_schedule}</span>
                    </div>
                  )}
                  {c.meeting_place && (
                    <div className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4" aria-hidden />
                      <span>{c.meeting_place}</span>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {c.is_open && (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Cara Gabung
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {c.whatsapp_group
                    ? 'Join grup WhatsApp di samping, atau hubungi kontak komunitas langsung.'
                    : c.contact_wa
                      ? 'Hubungi kontak WhatsApp di samping untuk bergabung.'
                      : 'Hubungi komunitas melalui kontak yang tersedia.'}
                </p>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Event Mendatang
                  </h3>
                  <Link
                    href={`/event?komunitas=${c.slug}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Lihat semua →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Info</h3>
              <dl className="mt-3 space-y-2 text-sm">
                {c.member_count > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" aria-hidden />
                    <span>{formatNumber(c.member_count)} anggota</span>
                  </div>
                )}
                {c.founded_year && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    <span>Berdiri {c.founded_year}</span>
                  </div>
                )}
                {(c.area || c.district) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden />
                    <span>{c.area ?? c.district}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  {c.view_count.toLocaleString('id-ID')} views
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Kontak</h3>
              <div className="mt-3 flex flex-col gap-2">
                {c.contact_wa && (
                  <Button asChild>
                    <a
                      href={`https://wa.me/${sanitizeWa(c.contact_wa)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {c.whatsapp_group && (
                  <Button asChild variant="outline">
                    <a
                      href={c.whatsapp_group}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Users className="h-4 w-4" aria-hidden />
                      Join Grup WA
                    </a>
                  </Button>
                )}
                {c.telegram_group && (
                  <Button asChild variant="outline">
                    <a
                      href={c.telegram_group}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  </Button>
                )}
                {c.contact_email && (
                  <Button asChild variant="outline">
                    <a href={`mailto:${c.contact_email}`}>
                      <Mail className="h-4 w-4" aria-hidden />
                      Email
                    </a>
                  </Button>
                )}
                {c.website && (
                  <Button asChild variant="outline">
                    <a href={c.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" aria-hidden />
                      Website
                    </a>
                  </Button>
                )}
              </div>

              {(c.instagram || c.tiktok || c.facebook || c.youtube) && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Sosial Media
                  </p>
                  <ul className="flex flex-col gap-1.5 text-sm">
                    {c.instagram && (
                      <li>
                        <a
                          href={`https://instagram.com/${c.instagram.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          Instagram · {c.instagram}
                        </a>
                      </li>
                    )}
                    {c.tiktok && (
                      <li>
                        <a
                          href={`https://tiktok.com/@${c.tiktok.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          TikTok · {c.tiktok}
                        </a>
                      </li>
                    )}
                    {c.facebook && (
                      <li>
                        <a
                          href={c.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          Facebook
                        </a>
                      </li>
                    )}
                    {c.youtube && (
                      <li>
                        <a
                          href={c.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                          YouTube
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {!c.is_claimed && (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
                <h3 className="text-sm font-semibold text-foreground">
                  Komunitas kamu?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Apakah ini komunitas kamu? Klaim untuk mengedit informasi dan
                  dapatkan badge Verified.
                </p>
                <Button asChild variant="outline" className="mt-3 w-full">
                  <Link href="/klaim">Klaim Komunitas</Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
