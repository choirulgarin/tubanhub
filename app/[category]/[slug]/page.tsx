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

// ISR: pre-generate halaman untuk tiap item published.
export async function generateStaticParams() {
  const slugs = await getPublishedItemSlugs();
  return slugs.map((s) => ({ category: s.category, slug: s.slug }));
}

// SEO: metadata per item — fallback aman ketika item tidak ditemukan.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getItemByCategoryAndSlug(params.category, params.slug);
  if (!item) {
    return { title: 'Tidak ditemukan — TubanHub' };
  }
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

// Helpers untuk membaca metadata jsonb dengan aman.
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

  // Metadata bidang per-kategori.
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

  // Build Google Maps embed URL. Prioritaskan lat/lng, fallback ke alamat.
  const gmapsEmbed = buildGmapsEmbed(item);

  const jsonLd = buildJsonLd(item, params.category);

  return (
    <>
      <ViewTracker itemId={item.id} />

      <script
        type="application/ld+json"
        // JSON-LD aman karena objek di-stringify di server; tidak ada input user mentah.
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

      <section className="section">
        <div className="container-app">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* KONTEN UTAMA */}
            <div className="space-y-8 lg:col-span-2">
              {/* Hero image */}
              {heroImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-card">
                  <Image
                    src={heroImage}
                    alt={item.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    className="object-cover"
                  />
                  {hargaTiket && (
                    <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow">
                      <Ticket className="h-4 w-4 text-accent" aria-hidden />
                      {hargaTiket}
                    </div>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {item.subcategory && (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
                    style={{ backgroundColor: `${color}1A`, color }}
                  >
                    {item.subcategory}
                  </span>
                )}
                {item.is_verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden />
                    Terverifikasi
                  </span>
                )}
                {item.tags?.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Content utama */}
              {item.content && (
                <article className="prose-custom">
                  <h2 className="mb-3 text-xl font-semibold text-slate-900">
                    Tentang
                  </h2>
                  <div className="whitespace-pre-line text-sm leading-relaxed text-slate-700 md:text-base">
                    {item.content}
                  </div>
                </article>
              )}

              {/* Metadata: Birokrasi — Syarat */}
              {syarat.length > 0 && (
                <MetaBlock
                  title="Syarat & Dokumen"
                  icon={FileText}
                  color={color}
                >
                  <ul className="space-y-2 text-sm text-slate-700 md:text-base">
                    {syarat.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </MetaBlock>
              )}

              {/* Metadata: Birokrasi — Biaya / Durasi / Dasar Hukum */}
              {(biaya || durasi || dasarHukum) && (
                <MetaBlock
                  title="Biaya & Ketentuan"
                  icon={Landmark}
                  color={color}
                >
                  <dl className="grid gap-4 sm:grid-cols-2">
                    {biaya && (
                      <InfoRow label="Biaya" value={biaya} />
                    )}
                    {durasi && (
                      <InfoRow label="Durasi Proses" value={durasi} />
                    )}
                    {dasarHukum && (
                      <div className="sm:col-span-2">
                        <InfoRow label="Dasar Hukum" value={dasarHukum} />
                      </div>
                    )}
                  </dl>
                </MetaBlock>
              )}

              {/* Metadata: Wisata — Fasilitas */}
              {fasilitas.length > 0 && (
                <MetaBlock
                  title="Fasilitas"
                  icon={Sparkles}
                  color={color}
                >
                  <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2 md:text-base">
                    {fasilitas.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color }}
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </MetaBlock>
              )}

              {/* Metadata: Wisata — Tips */}
              {tips.length > 0 && (
                <MetaBlock title="Tips Berkunjung" icon={Sparkles} color={color}>
                  <ul className="space-y-2 text-sm text-slate-700 md:text-base">
                    {tips.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </MetaBlock>
              )}

              {/* Google Maps embed */}
              {gmapsEmbed && (
                <MetaBlock title="Lokasi" icon={MapPin} color={color}>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <iframe
                      title={`Peta lokasi ${item.title}`}
                      src={gmapsEmbed}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="aspect-[16/9] w-full"
                      allowFullScreen
                    />
                  </div>
                  {item.gmaps_url && (
                    <a
                      href={item.gmaps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      Buka di Google Maps
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  )}
                </MetaBlock>
              )}

              <div>
                <Link
                  href={`/${item.category?.slug ?? ''}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Kembali ke {categoryName}
                </Link>
              </div>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              <SidebarCard title="Kontak">
                {item.phone || item.whatsapp || item.email || item.website ? (
                  <ul className="space-y-3 text-sm">
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
                  <p className="text-sm text-slate-500">
                    Kontak belum tersedia.
                  </p>
                )}
              </SidebarCard>

              {(item.address || item.district) && (
                <SidebarCard title="Alamat">
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color }}
                      aria-hidden
                    />
                    <div>
                      {item.address && <p>{item.address}</p>}
                      {item.district && (
                        <p className="text-slate-500">Kec. {item.district}</p>
                      )}
                    </div>
                  </div>
                </SidebarCard>
              )}

              {item.opening_hours && Object.keys(item.opening_hours).length > 0 && (
                <SidebarCard title="Jam Operasional">
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries(item.opening_hours).map(([day, hours]) => (
                      <li
                        key={day}
                        className="flex items-start justify-between gap-2"
                      >
                        <span className="capitalize text-slate-600">{day}</span>
                        <span className="text-right font-medium text-slate-800">
                          {String(hours)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SidebarCard>
              )}

              {estimasiWaktu && (
                <SidebarCard title="Estimasi Waktu">
                  <p className="flex items-center gap-2 text-sm text-slate-700">
                    <Clock className="h-4 w-4" style={{ color }} aria-hidden />
                    {estimasiWaktu}
                  </p>
                </SidebarCard>
              )}

              <ShareCard title={item.title} />
            </aside>
          </div>

          {/* Item terkait */}
          {related.length > 0 && (
            <div className="mt-16 space-y-6">
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                  {categoryName} Lainnya
                </h2>
                <Link
                  href={`/${item.category?.slug ?? ''}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Lihat semua →
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <ItemCard
                    key={r.id}
                    item={r}
                    variant={r.category?.slug === 'wisata' ? 'wisata' : 'default'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ---------- subcomponents (private) ----------

function MetaBlock({
  title,
  icon: Icon,
  color,
  children,
}: {
  title: string;
  icon: typeof FileText;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:p-6">
      <header className="mb-4 flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-800 md:text-base">
        {value}
      </dd>
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
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
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="break-all text-slate-800 hover:text-primary hover:underline"
      >
        {label}
      </a>
    </li>
  );
}

// Tombol Share — pakai Web Share API kalau tersedia, fallback copy URL.
function ShareCard({ title }: { title: string }) {
  return (
    <SidebarCard title="Bagikan">
      <ShareButtons title={title} />
    </SidebarCard>
  );
}

// ---------- helpers ----------

// JSON-LD struktur schema.org — tipe disesuaikan dengan kategori.
// Google akan memetakan ke rich result yang sesuai (GovernmentService / TouristAttraction / dll).
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
  // Mode `place` tanpa API key untuk embed view-only.
  if (item.lat != null && item.lng != null) {
    return `https://www.google.com/maps?q=${item.lat},${item.lng}&hl=id&z=16&output=embed`;
  }
  if (item.address) {
    const q = encodeURIComponent(`${item.address}, Tuban`);
    return `https://www.google.com/maps?q=${q}&hl=id&z=15&output=embed`;
  }
  return null;
}
