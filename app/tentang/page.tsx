import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Compass,
  HeartHandshake,
  Lightbulb,
  MapPin,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Tentang TubanHub',
  description:
    'TubanHub adalah hub informasi terpadu untuk warga dan wisatawan Kabupaten Tuban — dari layanan pemerintah, wisata, kuliner, sampai jasa lokal.',
  alternates: { canonical: '/tentang' },
};

// Halaman "Tentang" — statis, tidak butuh data dari DB.
export default function TentangPage() {
  return (
    <>
      <PageHeader
        title="Tentang TubanHub"
        description="Satu tempat untuk menemukan layanan pemerintah, destinasi wisata, kuliner, hingga jasa lokal di Kabupaten Tuban, Jawa Timur."
        icon={Compass}
        color="#2563EB"
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: 'Tentang' }]}
      />

      <section className="section">
        <div className="container-app grid gap-10 lg:grid-cols-3">
          {/* Visi & Misi */}
          <div className="space-y-8 lg:col-span-2">
            <article className="rounded-2xl bg-white p-6 shadow-card md:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                  Visi Kami
                </h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                Menjadi jendela digital paling terpercaya bagi siapa saja yang
                ingin mengenal, menjalani, atau mengunjungi Tuban — memudahkan
                urusan warga sekaligus memperkenalkan potensi daerah.
              </p>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-card md:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                  <HeartHandshake className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                  Misi
                </h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 md:text-base">
                <li className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  Menyajikan informasi layanan birokrasi yang akurat dan
                  mudah dimengerti — syarat, biaya, dan alur.
                </li>
                <li className="flex gap-3">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  Mempromosikan destinasi wisata, kuliner khas, serta
                  usaha kecil/jasa lokal agar lebih mudah ditemukan.
                </li>
                <li className="flex gap-3">
                  <Users
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden
                  />
                  Membuka ruang partisipasi: warga bisa mengusulkan
                  tempat atau layanan baru untuk dikurasi tim editor.
                </li>
              </ul>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-card md:p-8">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Lightbulb className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                  Cara Kerja
                </h2>
              </div>
              <ol className="mt-4 grid gap-4 sm:grid-cols-3">
                <li className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Langkah 1
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Jelajahi
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Cari layanan atau destinasi lewat kategori / pencarian.
                  </p>
                </li>
                <li className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Langkah 2
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Pelajari
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Lihat detail, kontak, peta, dan info relevan lainnya.
                  </p>
                </li>
                <li className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Langkah 3
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Kontribusi
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Usulkan tempat/layanan yang belum terdata di TubanHub.
                  </p>
                </li>
              </ol>
            </article>
          </div>

          {/* Sidebar CTA */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-6 shadow-card">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <MessageSquarePlus className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Usulkan Tempat
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Tahu tempat menarik atau layanan penting yang belum ada di
                sini? Bantu kami lengkapi datanya.
              </p>
              <Link
                href="/usul"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Kirim Usulan
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h3 className="text-sm font-semibold text-slate-900">
                Hubungi Kami
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Untuk kerja sama, koreksi informasi, atau pertanyaan lain,
                silakan hubungi tim editor TubanHub melalui halaman usulan
                dengan mencantumkan kontak Anda.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
