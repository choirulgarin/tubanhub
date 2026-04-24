import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { FilterBar, type SortValue } from '@/components/filters/FilterBar';
import { ItemGrid } from '@/components/items/ItemGrid';
import { AdSlot } from '@/components/ads/AdSlot';
import {
  getCategories,
  getItemsByCategory,
  getSubcategoriesForCategory,
  type ItemsSort,
} from '@/lib/queries';
import { getIcon } from '@/lib/icons';

function parseSort(v?: string): ItemsSort {
  return v === 'newest' || v === 'popular' ? v : 'az';
}

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Birokrasi & Layanan Publik — TubanHub',
  description:
    'Panduan layanan administrasi, perizinan, dan birokrasi di Kabupaten Tuban.',
  alternates: { canonical: '/birokrasi' },
};

type PageProps = {
  searchParams: { sub?: string; sort?: string };
};

export default async function BirokrasiPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const birokrasi = categories.find((c) => c.slug === 'birokrasi');
  if (!birokrasi) notFound();

  const activeSub = searchParams.sub?.trim() || undefined;
  const activeSort = parseSort(searchParams.sort);
  const [items, subcategories] = await Promise.all([
    getItemsByCategory('birokrasi', activeSub, activeSort),
    getSubcategoriesForCategory('birokrasi'),
  ]);

  const Icon = getIcon(birokrasi.icon);
  const color = birokrasi.color ?? '#2563EB';

  return (
    <>
      <PageHeader
        title={birokrasi.name}
        description={
          birokrasi.description ??
          'Panduan layanan administrasi & perizinan di Kabupaten Tuban.'
        }
        icon={Icon}
        color={color}
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: birokrasi.name }]}
      />

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
        <Alert>
          <Info />
          <AlertDescription>
            Data berikut disusun berdasarkan informasi publik. Untuk kepastian
            terbaru, silakan konfirmasi langsung ke kantor terkait melalui kontak
            yang tersedia di tiap layanan.
          </AlertDescription>
        </Alert>

        <AdSlot placement="category_top" categorySlug="birokrasi" />

        <FilterBar
          basePath="/birokrasi"
          subcategories={subcategories}
          activeSub={activeSub}
          activeSort={activeSort as SortValue}
          ariaLabel="Kategori birokrasi"
        />

        <p className="text-sm text-muted-foreground">
          Menampilkan{' '}
          <span className="font-medium text-foreground">{items.length}</span>{' '}
          layanan
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
              ? `Belum ada layanan pada kategori "${activeSub}".`
              : 'Data layanan belum tersedia. Silakan cek kembali nanti.'
          }
        />
      </section>
    </>
  );
}
