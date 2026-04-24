import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Ticket,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  FileText,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { RichContent } from '@/components/ui/RichContent';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/items/ItemCard';
import { ViewTracker } from '@/components/detail/ViewTracker';
import { ShareButtons } from '@/components/detail/ShareButtons';
import {
  getItemByCategoryAndSlug,
  getPublishedItemSlugs,
  getRelatedItems,
} from '@/lib/queries';
import { getIcon } from '@/lib/icons';
import type { ItemWithCategory } from '@/types';

export const revalidate = 300;
export const dynamicParams = true;

type PageProps = {
  params: { category: string; slug: string };
};

export async function generateStaticParams() {
  const slugs = await getPublishedItemSlugs();
  return slugs.map((s) => ({ category: s.category, slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getItemByCategoryAndSlug(params.category, params.slug);
  if (!item) return { title: 'Tidak ditemukan — TubanHub' };
  const desc =
    item.description?.slice(0, 155) ??
    `Informasi ${item.title} di Kabupaten Tuban — TubanHub`;
  return {
    title: `${item.title} — TubanHub`,
    description: desc,
    openGraph: {
      title: item.title,
      description: desc,
      images: item.thumbnail_url ? [{ url: item.thumbnail_url }] : undefined,
      type: 'article',
    },
  };
}

function asString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}

export default async function ItemDetailPage({ params }: PageProps) {
  const item = await getItemByCategoryAndSlug(params.category, params.slug);
  if (!item) notFound();

  const color = item.category?.color ?? '#2563EB';
  const categoryName = item.category?.name ?? 'Kategori';
  const CategoryIcon = getIcon(item.category?.icon);

  const related = await getRelatedItems(item.category_id, item.id, 3);

  const meta = item.metadata ?? {};
  const syarat = asStringArray(meta['syarat']);
  const biaya = asString(meta['biaya']);
  const durasi = asString(meta['durasi']);
  const dasarHukum = asString(meta['dasar_hukum']);
  const hargaTiket = asString(meta['harga_tiket']);
  const fasilitas = asStringArray(meta['fasilitas']);
  const tips = asStringArray(meta['tips']);
  const estimasiWaktu = asString(meta['estimasi_waktu']);

  const heroImage = item.thumbnail_url ?? item.images?.[0] ?? null;
  const gmapsEmbed = buildGmapsEmbed(item);
  const jsonLd = buildJsonLd(item, params.category);

  return (
    <>
      <ViewTracker itemId={item.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        title={item.title}
        description={item.description ?? undefined}
        icon={CategoryIcon}
        color={color}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: categoryName, href: `/${item.category?.slug ?? ''}` },
          { label: item.title },
        ]}
      />

      <section className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* KONTEN UTAMA */}
          <div className="space-y-8 lg:col-span-2">
            {heroImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={heroImage}
                  alt={item.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
                {hargaTiket && (
                  <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium text-foreground">
                    <Ticket className="h-3 w-3" aria-hidden />
                    {hargaTiket}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {item.subcategory && (
                <Badge variant="secondary" className="text-xs">
                  {item.subcategory}
                </Badge>
              )}
              {item.is_verified && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3" aria-hidden />
                  Terverifikasi
                </span>
              )}
              {item.tags?.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>

            {item.content && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">Tentang</h2>
                <Separator className="my-3" />
                <RichContent content={item.content} />
              </div>
            )}

            {syarat.length > 0 && (
              <MetaBlock title="Syarat & Dokumen" icon={FileText}>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {syarat.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                      />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </MetaBlock>
            )}

            {(biaya || durasi || dasarHukum) && (
              <MetaBlock title="Biaya & Ketentuan" icon={Landmark}>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {biaya && <InfoRow label="Biaya" value={biaya} />}
                  {durasi && <InfoRow label="Durasi Proses" value={durasi} />}
                  {dasarHukum && (
                    <div className="sm:col-span-2">
                      <InfoRow label="Dasar Hukum" value={dasarHukum} />
                    </div>
                  )}
                </dl>
              </MetaBlock>
            )}

            {fasilitas.length > 0 && (
              <MetaBlock title="Fasilitas" icon={Sparkles}>
                <ul className="grid gap-1.5 text-sm text-foreground sm:grid-cols-2">
                  {fasilitas.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </MetaBlock>
            )}

            {tips.length > 0 && (
              <MetaBlock title="Tips Berkunjung" icon={Sparkles}>
                <ul className="space-y-1.5 text-sm text-foreground">
                  {tips.map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span
                        aria-hidden
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground"
                      />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </MetaBlock>
            )}

            {gmapsEmbed && (
              <MetaBlock title="Lokasi" icon={MapPin}>
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    title={`Peta lokasi ${item.title}`}
                    src={gmapsEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="aspect-video w-full"
                    allowFullScreen
                  />
                </div>
                {item.gmaps_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    render={
                      <a
                        href={item.gmaps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <ExternalLink />
                    Buka di Google Maps
                  </Button>
                )}
              </MetaBlock>
            )}

            <Link
              href={`/${item.category?.slug ?? ''}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Kembali ke {categoryName}
            </Link>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">
            <SidebarCard title="Kontak">
              {item.phone || item.whatsapp || item.email || item.website ? (
                <ul className="space-y-2.5 text-sm">
                  {item.phone && (
                    <ContactRow
                      icon={Phone}
                      label={item.phone}
                      href={`tel:${item.phone}`}
                    />
                  )}
                  {item.whatsapp && (
                    <ContactRow
                      icon={Phone}
                      label={`WhatsApp: ${item.whatsapp}`}
                      href={`https://wa.me/${item.whatsapp.replace(/[^\d]/g, '')}`}
                      external
                    />
                  )}
                  {item.email && (
                    <ContactRow
                      icon={Mail}
                      label={item.email}
                      href={`mailto:${item.email}`}
                    />
                  )}
                  {item.website && (
                    <ContactRow
                      icon={Globe}
                      label={item.website.replace(/^https?:\/\//, '')}
                      href={item.website}
                      external
                    />
                  )}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Kontak belum tersedia.
                </p>
              )}
            </SidebarCard>

            {(item.address || item.district) && (
              <SidebarCard title="Alamat">
                <div className="flex items-start gap-2 text-sm text-foreground">
                  <MapPin
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div>
                    {item.address && <p>{item.address}</p>}
                    {item.district && (
                      <p className="text-muted-foreground">Kec. {item.district}</p>
                    )}
                  </div>
                </div>
              </SidebarCard>
            )}

            {item.opening_hours && Object.keys(item.opening_hours).length > 0 && (
              <SidebarCard title="Jam Operasional">
                <ul className="space-y-1 text-sm">
                  {Object.entries(item.opening_hours).map(([day, hours]) => (
                    <li key={day} className="flex items-start justify-between gap-2">
                      <span className="capitalize text-muted-foreground">{day}</span>
                      <span className="text-right text-foreground">
                        {String(hours)}
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarCard>
            )}

            {estimasiWaktu && (
              <SidebarCard title="Estimasi Waktu">
                <p className="flex items-center gap-2 text-sm text-foreground">
                  <Clock
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  {estimasiWaktu}
                </p>
              </SidebarCard>
            )}

            <SidebarCard title="Bagikan">
              <ShareButtons title={item.title} />
            </SidebarCard>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {categoryName} Lainnya
              </h2>
              <Link
                href={`/${item.category?.slug ?? ''}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Lihat semua →
              </Link>
            </div>
            <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {related.map((r) => (
                <div key={r.id} className="w-72 shrink-0 snap-start md:w-auto">
                  <ItemCard
                    item={r}
                    variant={r.category?.slug === 'wisata' ? 'wisata' : 'default'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

// ---------- subcomponents ----------

function MetaBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </header>
      <Separator className="mb-4" />
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  href,
  external,
}: {
  icon: typeof Phone;
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <Icon
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="break-all text-foreground transition-colors hover:text-primary"
      >
        {label}
      </a>
    </li>
  );
}

// ---------- helpers ----------

function buildJsonLd(item: ItemWithCategory, categorySlug: string) {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://tubanhub.id'
  ).replace(/\/$/, '');
  const url = `${appUrl}/${categorySlug}/${item.slug}`;

  const TYPE_BY_CATEGORY: Record<string, string> = {
    birokrasi: 'GovernmentService',
    wisata: 'TouristAttraction',
    kuliner: 'FoodEstablishment',
    jasa: 'LocalBusiness',
  };
  const type = TYPE_BY_CATEGORY[categorySlug] ?? 'Thing';

  const address =
    item.address || item.district
      ? {
          '@type': 'PostalAddress',
          streetAddress: item.address ?? undefined,
          addressLocality: item.district ?? 'Tuban',
          addressRegion: 'Jawa Timur',
          addressCountry: 'ID',
        }
      : undefined;

  const geo =
    item.lat != null && item.lng != null
      ? { '@type': 'GeoCoordinates', latitude: item.lat, longitude: item.lng }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': url,
    url,
    name: item.title,
    description: item.description ?? undefined,
    image: item.thumbnail_url ?? item.images?.[0] ?? undefined,
    address,
    geo,
    telephone: item.phone ?? undefined,
    email: item.email ?? undefined,
    sameAs: item.website ? [item.website] : undefined,
  };
}

function buildGmapsEmbed(item: ItemWithCategory): string | null {
  if (item.lat != null && item.lng != null) {
    return `https://www.google.com/maps?q=${item.lat},${item.lng}&hl=id&z=16&output=embed`;
  }
  if (item.address) {
    const q = encodeURIComponent(`${item.address}, Tuban`);
    return `https://www.google.com/maps?q=${q}&hl=id&z=15&output=embed`;
  }
  return null;
}
