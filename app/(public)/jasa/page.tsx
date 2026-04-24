import type { Metadata } from 'next';
import { Wrench, Info } from 'lucide-react';
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
  title: 'Jasa & Layanan Lokal Tuban — TubanHub',
  description:
    'Temukan jasa dan layanan lokal terpercaya di Tuban — rental, percetakan, bengkel, dan lainnya.',
  alternates: { canonical: '/jasa' },
};

const JASA_SUBS = ['Rental Kendaraan', 'Percetakan', 'Bengkel', 'Lainnya'];

function parseSort(v?: string): ItemsSort {
  return v === 'newest' || v === 'popular' ? v : 'az';
}

type PageProps = {
  searchParams: { sub?: string; sort?: string };
};

export default async function JasaPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const jasa = categories.find((c) => c.slug === 'jasa');

  const activeSub = searchParams.sub?.trim() || undefined;
  const activeSort = parseSort(searchParams.sort);
  const items = jasa
    ? await getItemsByCategory('jasa', activeSub, activeSort)
    : [];

  const color = jasa?.color ?? '#7C3AED';
  const title = jasa?.name ?? 'Jasa & Layanan Lokal';
  const description =
    jasa?.description ??
    'Temukan jasa dan layanan lokal terpercaya di Tuban.';

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        icon={Wrench}
        color={color}
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: title }]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
        <Alert>
          <Info />
          <AlertDescription>
            Jasa dan layanan lokal Tuban yang siap membantu kebutuhanmu.
          </AlertDescription>
        </Alert>

        <AdSlot placement="category_top" categorySlug="jasa" />

        <FilterBar
          basePath="/jasa"
          subcategories={JASA_SUBS}
          activeSub={activeSub}
          activeSort={activeSort as SortValue}
          ariaLabel="Kategori jasa"
        />

        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-medium text-foreground">{items.length}</span>{' '}
          penyedia jasa
          {activeSub && (
            <>
              {' '}pada kategori{' '}
              <span className="font-medium text-foreground">{activeSub}</span>
            </>
          )}
        </p>

        <ItemGrid
          items={items}
          emptyMessage={
            activeSub
              ? `Belum ada jasa pada kategori "${activeSub}".`
              : 'Direktori jasa sedang kami kurasi. Rekomendasi? Kirim lewat halaman Usulkan Tempat.'
          }
        />
      </section>
    </>
  );
}
