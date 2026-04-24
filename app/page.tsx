import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileText,
  Search,
  Smartphone,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ItemGrid } from '@/components/items/ItemGrid';
import { InstallButton } from '@/components/pwa/InstallButton';
import { getIcon } from '@/lib/icons';
import { getCategories, getCategoryCounts, getFeaturedItems } from '@/lib/queries';

export const revalidate = 300; // regenerate landing tiap 5 menit

export default async function HomePage() {
  // Fetch paralel — categories, count per kategori, featured birokrasi & wisata.
  const [categories, counts, birokrasiItems, wisataItems] = await Promise.all([
    getCategories(),
    getCategoryCounts(),
    getFeaturedItems('birokrasi', 3),
    getFeaturedItems('wisata', 3),
  ]);

  return (
    <>
      {/* =================================================================
          HERO
          ================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-green-500">
        {/* Pattern dots halus */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Orb gradient dekoratif */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-green-300/20 blur-3xl"
        />

        <div className="container-app relative flex min-h-[80vh] flex-col items-center justify-center py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Platform Informasi Tuban #1
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
            Semua tentang Tuban,
            <br />
            dalam satu{' '}
            <span className="relative inline-block">
              genggaman
              <span
                aria-hidden
                className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-green-300"
              />
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base text-blue-100 md:text-xl">
            Temukan informasi layanan pemerintah, wisata, kuliner, dan jasa lokal
            Tuban — cepat, lengkap, dan terpercaya.
          </p>

          {/* Search form — GET method, submit ke /search */}
          <form
            action="/search"
            method="get"
            className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl"
          >
            <label htmlFor="hero-search" className="sr-only">
              Cari informasi Tuban
            </label>
            <Search className="ml-3 h-5 w-5 text-slate-400" aria-hidden />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Cari layanan KTP, wisata, kuliner Tuban..."
              className="flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none md:text-base"
            />
            <Button type="submit" size="lg" className="gap-2">
              <Search className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Cari</span>
            </Button>
          </form>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-blue-100">
            <span>15+ Layanan Pemerintah</span>
            <span aria-hidden className="hidden h-4 w-px bg-blue-200/40 md:inline-block" />
            <span>10+ Destinasi Wisata</span>
            <span aria-hidden className="hidden h-4 w-px bg-blue-200/40 md:inline-block" />
            <span>Gratis &amp; Terbuka</span>
          </div>
        </div>
      </section>

      {/* =================================================================
          CATEGORY CARDS
          ================================================================= */}
      <section className="section">
        <div className="container-app">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Jelajahi Tuban
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Pilih kategori yang kamu butuhkan
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="mx-auto max-w-md text-center text-sm text-slate-500">
              Kategori belum tersedia. Pastikan schema database sudah dijalankan
              di Supabase.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {categories.map((cat) => {
                const Icon = getIcon(cat.icon);
                const color = cat.color ?? '#2563EB';
                const count = counts[cat.id] ?? 0;
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="group relative flex flex-col rounded-2xl bg-white p-5 shadow-card card-hover md:p-6"
                  >
                    <div
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}26`, color }}
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 md:text-lg">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                        {cat.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>{count} item</span>
                      <ArrowRight
                        className="h-4 w-4 translate-x-0 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                        style={{ color }}
                        aria-hidden
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* =================================================================
          FEATURED BIROKRASI
          ================================================================= */}
      <section className="bg-slate-50 py-12">
        <div className="container-app">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                Layanan Pemerintah
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Panduan administrasi kependudukan Tuban
              </p>
            </div>
            <Link
              href="/birokrasi"
              className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-primary hover:underline"
            >
              Lihat Semua <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ItemGrid
            items={birokrasiItems}
            emptyMessage="Belum ada layanan birokrasi yang dipublikasikan."
          />
        </div>
      </section>

      {/* =================================================================
          FEATURED WISATA
          ================================================================= */}
      <section className="py-12">
        <div className="container-app">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
                Destinasi Wisata
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Temukan keindahan Tuban
              </p>
            </div>
            <Link
              href="/wisata"
              className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-secondary hover:underline"
            >
              Lihat Semua <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <ItemGrid
            items={wisataItems}
            variant="wisata"
            emptyMessage="Belum ada destinasi wisata yang dipublikasikan."
          />
        </div>
      </section>

      {/* =================================================================
          HOW IT WORKS
          ================================================================= */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="container-app">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Cara Menggunakan TubanHub
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Tiga langkah sederhana untuk menemukan informasi yang kamu butuhkan
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {/* Connector line (desktop only) */}
            <div
              aria-hidden
              className="absolute inset-x-[16.67%] top-10 hidden h-0.5 bg-gradient-to-r from-primary/40 via-primary/40 to-secondary/40 md:block"
            />

            {[
              {
                icon: Search,
                title: 'Cari Informasi',
                desc: 'Ketik kata kunci di search bar atau pilih kategori yang sesuai.',
              },
              {
                icon: FileText,
                title: 'Baca Panduan',
                desc: 'Dapatkan informasi lengkap, syarat, dan prosedur secara detail.',
              },
              {
                icon: CheckCircle2,
                title: 'Ambil Tindakan',
                desc: 'Hubungi langsung atau kunjungi lokasinya dengan info yang jelas.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-card ring-4 ring-white">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
                    <step.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <span
                    aria-hidden
                    className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white"
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          PWA INSTALL
          ================================================================= */}
      <section className="py-12">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 text-center text-white md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />

            <div className="relative mx-auto flex max-w-2xl flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Smartphone className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="mt-4 text-2xl font-bold md:text-3xl">
                Install TubanHub di HP Kamu
              </h2>
              <p className="mt-2 text-sm text-blue-50 md:text-base">
                Akses lebih cepat seperti aplikasi. Gratis, tanpa App Store.
              </p>

              <ul className="mt-6 grid w-full max-w-lg grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {['Akses offline', 'Notifikasi penting', 'Lebih cepat', 'Hemat data'].map(
                  (f) => (
                    <li key={f} className="inline-flex items-center gap-2 text-left">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                      {f}
                    </li>
                  ),
                )}
              </ul>

              <div className="mt-7">
                <InstallButton />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          CTA KONTRIBUSI
          ================================================================= */}
      <section className="bg-slate-50 py-12">
        <div className="container-app">
          <div className="grid items-center gap-10 rounded-3xl bg-white p-8 shadow-card md:grid-cols-2 md:p-12">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <MapPin className="h-3 w-3" aria-hidden />
                Kontribusi Warga
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
                Bantu Lengkapi Data Tuban
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                Kenal tempat makan enak, destinasi wisata tersembunyi, atau jasa
                lokal yang belum tercantum? Usulkan lewat form sederhana dan
                bantu warga Tuban lainnya menemukan tempat-tempat berharga.
              </p>
              <div className="mt-6">
                <Link
                  href="/usulkan"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow hover:bg-primary-dark"
                >
                  Usulkan Tempat
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                'Data publik — bebas dilihat semua warga dan wisatawan',
                'Tim kami verifikasi sebelum dipublikasikan',
                'Dapat badge "Kontributor TubanHub" di profil usulanmu',
                'Bantu UMKM lokal dapat exposure gratis',
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="text-sm text-slate-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
