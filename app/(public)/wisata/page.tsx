import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar, type SortValue } from '@/components/filters/FilterBar';
import { ItemGrid } from '@/components/items/ItemGrid';
import { AdSlot } from '@/components/ads/AdSlot';
import {
  getCategories,
  getItemsByCategory,
  type ItemsSort,
} from '@/lib/queries';
import { getIcon } from '@/lib/icons';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Wisata Tuban — Destinasi, Budaya & Alam — TubanHub',
  description:
    'Jelajahi destinasi wisata Kabupaten Tuban: wisata alam, religi, hingga budaya.',
  alternates: { canonical: '/wisata' },
};

const WISATA_SUBS = ['Wisata Alam', 'Wisata Religi', 'Wisata Budaya'];

function parseSort(v?: string): ItemsSort {
  return v === 'newest' || v === 'popular' ? v : 'az';
}

type PageProps = {
  searchParams: { sub?: string; sort?: string };
};

export default async function WisataPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const wisata = categories.find((c) => c.slug === 'wisata');
  if (!wisata) notFound();

  const activeSub = searchParams.sub?.trim() || undefined;
  const activeSort = parseSort(searchParams.sort);
  const items = await getItemsByCategory('wisata', activeSub, activeSort);

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

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
        <AdSlot placement="category_top" categorySlug="wisata" />

        <FilterBar
          basePath="/wisata"
          subcategories={WISATA_SUBS}
          activeSub={activeSub}
          activeSort={activeSort as SortValue}
          ariaLabel="Kategori wisata"
        />

        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-medium text-foreground">{items.length}</span>{' '}
          destinasi
          {activeSub && (
            <>
              {' '}pada kategori{' '}
              <span className="font-medium text-foreground">{activeSub}</span>
            </>
          )}
        </p>

        <ItemGrid
          items={items}
          variant="wisata"
          emptyMessage={
            activeSub
              ? `Belum ada destinasi pada kategori "${activeSub}".`
              : 'Data destinasi belum tersedia. Silakan cek kembali nanti.'
          }
        />
      </section>
    </>
  );
}
