import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { ItemGrid } from '@/components/items/ItemGrid';
import { getCategories, getItemsByCategory } from '@/lib/queries';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Wisata Tuban — Destinasi, Budaya & Alam — TubanHub',
  description:
    'Jelajahi destinasi wisata Kabupaten Tuban: wisata alam, religi, hingga budaya. Informasi lokasi, harga tiket, dan jam operasional.',
  alternates: { canonical: '/wisata' },
  openGraph: {
    title: 'Wisata Tuban — Destinasi Alam, Religi & Budaya',
    description:
      'Panduan lengkap destinasi wisata di Kabupaten Tuban — harga tiket, lokasi, dan tips berkunjung.',
    type: 'website',
  },
};

// Tab statis sesuai spesifikasi — hardcoded supaya urutan & label konsisten.
const WISATA_TABS: Array<{ label: string; value?: string }> = [
  { label: 'Semua' },
  { label: 'Wisata Alam', value: 'Wisata Alam' },
  { label: 'Wisata Religi', value: 'Wisata Religi' },
  { label: 'Wisata Budaya', value: 'Wisata Budaya' },
];

type PageProps = {
  searchParams: { sub?: string };
};

export default async function WisataPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const wisata = categories.find((c) => c.slug === 'wisata');
  if (!wisata) notFound();

  const activeSub = searchParams.sub?.trim() || undefined;
  const items = await getItemsByCategory('wisata', activeSub);

  const Icon = getIcon(wisata.icon);
  const color = wisata.color ?? '#16A34A';

  return (
    <>
      <PageHeader
        title={wisata.name}
        description={
          wisata.description ??
          'Jelajahi destinasi wisata alam, religi, dan budaya Kabupaten Tuban.'
        }
        icon={Icon}
        color={color}
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: wisata.name }]}
      />

      <section className="section">
        <div className="container-app space-y-6">
          {/* Tabs subcategory */}
          <div
            role="tablist"
            aria-label="Kategori wisata"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
          >
            {WISATA_TABS.map((tab) => {
              const isActive = (tab.value ?? undefined) === activeSub
                || (!tab.value && !activeSub);
              const href = tab.value
                ? `/wisata?sub=${encodeURIComponent(tab.value)}`
                : '/wisata';
              return (
                <Link
                  key={tab.label}
                  href={href}
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition',
                    isActive
                      ? 'border-secondary bg-secondary text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-secondary hover:text-secondary',
                  )}
                  style={
                    isActive
                      ? { backgroundColor: color, borderColor: color }
                      : undefined
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-900">{items.length}</span>{' '}
              destinasi
              {activeSub && (
                <>
                  {' '}pada kategori{' '}
                  <span className="font-semibold text-slate-900">{activeSub}</span>
                </>
              )}
            </p>
          </div>

          <ItemGrid
            items={items}
            variant="wisata"
            emptyMessage={
              activeSub
                ? `Belum ada destinasi pada kategori "${activeSub}".`
                : 'Data destinasi belum tersedia. Silakan cek kembali nanti.'
            }
          />
        </div>
      </section>
    </>
  );
}
