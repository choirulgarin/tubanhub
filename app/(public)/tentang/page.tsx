import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Tentang TubanHub',
  description:
    'TubanHub adalah hub informasi terpadu untuk warga dan wisatawan Kabupaten Tuban — dari layanan pemerintah, wisata, kuliner, sampai jasa lokal.',
  alternates: { canonical: '/tentang' },
};

export default function TentangPage() {
  return (
    <>
      <PageHeader
        title="Tentang TubanHub"
        description="Satu tempat untuk menemukan layanan pemerintah, destinasi wisata, kuliner, hingga jasa lokal di Kabupaten Tuban, Jawa Timur."
        icon={Compass}
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: 'Tentang' }]}
      />

      <section className="mx-auto w-full max-w-2xl space-y-10 px-4 py-12">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Visi</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Menjadi jendela digital paling terpercaya bagi siapa saja yang
            ingin mengenal, menjalani, atau mengunjungi Tuban — memudahkan
            urusan warga sekaligus memperkenalkan potensi daerah.
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Misi</h2>
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li>
              — Menyajikan informasi layanan birokrasi yang akurat dan mudah
              dimengerti: syarat, biaya, dan alur.
            </li>
            <li>
              — Mempromosikan destinasi wisata, kuliner khas, serta usaha
              kecil dan jasa lokal agar lebih mudah ditemukan.
            </li>
            <li>
              — Membuka ruang partisipasi: warga bisa mengusulkan tempat
              atau layanan baru untuk dikurasi tim editor.
            </li>
          </ul>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Cara Kerja</h2>
          <ol className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1. Jelajahi</span>{' '}
              — cari layanan atau destinasi lewat kategori atau pencarian.
            </li>
            <li>
              <span className="font-medium text-foreground">2. Pelajari</span>{' '}
              — lihat detail, kontak, peta, dan info relevan lainnya.
            </li>
            <li>
              <span className="font-medium text-foreground">3. Kontribusi</span>{' '}
              — usulkan tempat atau layanan yang belum terdata di TubanHub.
            </li>
          </ol>
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Punya usulan?
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Bantu kami melengkapi data Tuban. Kirim usulan tempat atau
            layanan lewat form pendek — tim editor akan meninjau sebelum
            dipublikasikan.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild size="sm">
              <Link href="/usul">Usulkan Tempat</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/kontak">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
