import type { Metadata } from 'next';
import { Utensils, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar, type SortValue } from '@/components/filters/FilterBar';
import { ItemGrid } from '@/components/items/ItemGrid';
import { AdSlot } from '@/components/ads/AdSlot';
import {
  getCategories,
  getItemsByCategory,
  type ItemsSort,
} from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Kuliner Tuban — Sego Boran, Legen & Lainnya — TubanHub',
  description:
    'Rekomendasi tempat makan dan kuliner khas Tuban — dari Sego Boran hingga Legen segar.',
  alternates: { canonical: '/kuliner' },
};

const KULINER_SUBS = [
  'Makanan Khas',
  'Warung & Resto',
  'Kafe & Minuman',
  'Minuman Khas',
  'Oleh-oleh & Camilan',
];

function parseSort(v?: string): ItemsSort {
  return v === 'newest' || v === 'popular' ? v : 'az';
}

type PageProps = {
  searchParams: { sub?: string; sort?: string };
};

export default async function KulinerPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const kuliner = categories.find((c) => c.slug === 'kuliner');

  const activeSub = searchParams.sub?.trim() || undefined;
  const activeSort = parseSort(searchParams.sort);
  const items = kuliner
    ? await getItemsByCategory('kuliner', activeSub, activeSort)
    : [];

  const color = kuliner?.color ?? '#EA580C';
  const title = kuliner?.name ?? 'Kuliner Tuban';
  const description =
    kuliner?.description ??
    'Rekomendasi tempat makan dan kuliner khas Tuban.';

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        icon={Utensils}
        color={color}
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: title }]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
        <Alert>
          <Info />
          <AlertDescription>
            Temukan kuliner autentik Tuban — dari Sego Boran hingga Legen segar.
          </AlertDescription>
        </Alert>

        <AdSlot placement="category_top" categorySlug="kuliner" />

        <FilterBar
          basePath="/kuliner"
          subcategories={KULINER_SUBS}
          activeSub={activeSub}
          activeSort={activeSort as SortValue}
          ariaLabel="Kategori kuliner"
        />

        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-medium text-foreground">{items.length}</span>{' '}
          tempat
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
              ? `Belum ada tempat kuliner pada kategori "${activeSub}".`
              : 'Data kuliner sedang kami kurasi. Punya rekomendasi? Kirim lewat halaman Usulkan Tempat.'
          }
        />
      </section>
    </>
  );
}
