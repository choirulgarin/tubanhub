import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Info } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ItemGrid } from '@/components/items/ItemGrid';
import { getCategories, getItemsByCategory, getSubcategoriesForCategory } from '@/lib/queries';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Birokrasi & Layanan Publik — TubanHub',
  description:
    'Panduan layanan administrasi, perizinan, dan birokrasi di Kabupaten Tuban. Temukan syarat, alur, dan kontak lengkap.',
  alternates: { canonical: '/birokrasi' },
  openGraph: {
    title: 'Birokrasi & Layanan Publik di Tuban',
    description:
      'Syarat, alur, biaya, dan kontak layanan pemerintah di Kabupaten Tuban.',
    type: 'website',
  },
};

type PageProps = {
  searchParams: { sub?: string };
};

// Halaman kategori Birokrasi — daftar layanan publik + filter subcategory via ?sub=
export default async function BirokrasiPage({ searchParams }: PageProps) {
  const categories = await getCategories();
  const birokrasi = categories.find((c) => c.slug === 'birokrasi');
  if (!birokrasi) {
    // Kategori belum di-seed → 404 supaya jelas, bukan tampil kosong generik.
    notFound();
  }

  const activeSub = searchParams.sub?.trim() || undefined;
  const [items, subcategories] = await Promise.all([
    getItemsByCategory('birokrasi', activeSub),
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

      <section className="section">
        <div className="container-app space-y-6">
          {/* Info box — tone informasi ringan */}
          <div
            className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700"
            role="note"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="leading-relaxed">
              Data berikut disusun berdasarkan informasi publik. Untuk kepastian
              terbaru, silakan konfirmasi langsung ke kantor terkait melalui kontak
              yang tersedia di tiap layanan.
            </p>
          </div>

          {/* Filter subcategory (chip-style). "Semua" me-reset query. */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <SubChip label="Semua" href="/birokrasi" active={!activeSub} />
              {subcategories.map((sub) => (
                <SubChip
                  key={sub}
                  label={sub}
                  href={`/birokrasi?sub=${encodeURIComponent(sub)}`}
                  active={activeSub === sub}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-900">{items.length}</span>{' '}
              layanan
              {activeSub && (
                <>
                  {' '}
                  pada kategori{' '}
                  <span className="font-semibold text-slate-900">{activeSub}</span>
                </>
              )}
            </p>
          </div>

          <ItemGrid
            items={items}
            emptyMessage={
              activeSub
                ? `Belum ada layanan pada kategori "${activeSub}".`
                : 'Data layanan belum tersedia. Silakan cek kembali nanti.'
            }
          />
        </div>
      </section>
    </>
  );
}

function SubChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border px-3.5 py-1.5 text-sm transition',
        active
          ? 'border-primary bg-primary text-white shadow-sm'
          : 'border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary',
      )}
    >
      {label}
    </Link>
  );
}
