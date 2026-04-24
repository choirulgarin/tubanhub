import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  BadgeCheck,
  HandCoins,
  Zap,
  MessageSquare,
  Mail,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import {
  PlatformIcon,
  formatFollowers,
  formatRupiahShort,
} from '@/components/influencer/PlatformIcon';
import { InfluencerViewTracker } from '@/components/influencer/ViewTracker';
import { getInfluencerBySlug, getInfluencerSlugs } from '@/lib/queries';

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getInfluencerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const inf = await getInfluencerBySlug(params.slug);
  if (!inf) return { title: 'Influencer tidak ditemukan — TubanHub' };
  return {
    title: `${inf.name} — Influencer Tuban — TubanHub`,
    description: inf.bio ?? `Profil influencer ${inf.name} di Tuban`,
    alternates: { canonical: `/influencer/${inf.slug}` },
  };
}

const LANG_LABEL: Record<string, string> = {
  indonesia: 'Bahasa Indonesia',
  jawa: 'Bahasa Jawa',
  campur: 'Campur (Indonesia & Jawa)',
};

function sanitizeWa(v: string) {
  return v.replace(/[^0-9]/g, '');
}

export default async function InfluencerDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const inf = await getInfluencerBySlug(params.slug);
  if (!inf) notFound();

  const tier = inf.highlight_tier;

  return (
    <>
      <InfluencerViewTracker id={inf.id} />
      <PageHeader
        title={inf.name}
        description={inf.location ?? undefined}
        icon={BadgeCheck}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Influencer', href: '/influencer' },
          { label: inf.name },
        ]}
      />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        {/* MAIN */}
        <div className="space-y-8 md:col-span-2">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
              {inf.photo_url ? (
                <Image
                  src={inf.photo_url}
                  alt={inf.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-muted-foreground">
                  {inf.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {inf.name}
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
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
                {inf.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <BadgeCheck className="h-3 w-3" aria-hidden />
                    Verified
                  </span>
                )}
                {inf.is_claimed && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                    Owner Verified
                  </span>
                )}
                {inf.is_umkm_friendly && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                    <HandCoins className="h-3 w-3" aria-hidden />
                    UMKM Friendly
                  </span>
                )}
                {inf.is_fast_response && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <Zap className="h-3 w-3" aria-hidden />
                    Fast Response
                  </span>
                )}
              </div>
            </div>
          </div>

          {inf.bio && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Tentang
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {inf.bio}
              </p>
            </div>
          )}

          {inf.platforms.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Platform & Jangkauan
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {inf.platforms.map((p) => (
                  <li
                    key={p.platform + p.username}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <PlatformIcon platform={p.platform} className="h-5 w-5 text-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFollowers(p.followers)} followers · {p.platform}
                      </p>
                    </div>
                    {p.url && (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center text-muted-foreground hover:text-foreground"
                        aria-label={`Buka ${p.platform}`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {inf.niches.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Niche & Spesialisasi
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {inf.niches.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize text-secondary-foreground"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Bahasa Konten
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {LANG_LABEL[inf.content_language] ?? inf.content_language}
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Contoh Konten
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Lihat portfolio terbaru langsung di akun sosial media mereka di
              atas.
            </p>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Rate Card</h3>
            <p className="mt-3 text-2xl font-semibold text-foreground">
              {inf.rate_min && inf.rate_max
                ? `${formatRupiahShort(inf.rate_min)} – ${formatRupiahShort(inf.rate_max)}`
                : 'Hubungi untuk harga'}
            </p>
            {inf.rate_notes && (
              <p className="mt-1 text-xs text-muted-foreground">
                {inf.rate_notes}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {inf.contact_wa && (
                <Button asChild>
                  <a
                    href={`https://wa.me/${sanitizeWa(inf.contact_wa)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageSquare className="h-4 w-4" aria-hidden />
                    Hubungi via WhatsApp
                  </a>
                </Button>
              )}
              {inf.contact_email && (
                <Button asChild variant="outline">
                  <a href={`mailto:${inf.contact_email}`}>
                    <Mail className="h-4 w-4" aria-hidden />
                    Email
                  </a>
                </Button>
              )}
              {inf.contact_dm && (
                <Button asChild variant="outline">
                  <a
                    href={inf.platforms.find((p) => p.platform === inf.contact_dm)?.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DM di {inf.contact_dm}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Info</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {inf.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden />
                  <span>{inf.location}</span>
                </div>
              )}
              {inf.district && (
                <div className="text-xs text-muted-foreground">
                  Kecamatan: {inf.district}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                {inf.view_count.toLocaleString('id-ID')} views
              </div>
            </dl>
          </div>

          {!inf.is_claimed && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
              <h3 className="text-sm font-semibold text-foreground">
                Profil kamu?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Apakah ini profil kamu? Klaim untuk mengedit informasi dan
                dapatkan badge Owner Verified.
              </p>
              <Button asChild variant="outline" className="mt-3 w-full">
                <Link href="/klaim">Klaim Profil</Link>
              </Button>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
