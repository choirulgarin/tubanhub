import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ItemGrid } from '@/components/items/ItemGrid';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { AdCard } from '@/components/ads/AdCard';
import { EmergencyNumbers } from '@/components/EmergencyNumbers';
import { getIcon } from '@/lib/icons';
import {
  getActiveAds,
  getActiveBannerAnnouncement,
  getCategories,
  getCategoryCounts,
  getFeaturedItems,
} from '@/lib/queries';

export const revalidate = 300;

export default async function HomePage() {
  const [categories, counts, birokrasiItems, wisataItems, banner, ads] =
    await Promise.all([
      getCategories(),
      getCategoryCounts(),
      getFeaturedItems('birokrasi', 3),
      getFeaturedItems('wisata', 3),
      getActiveBannerAnnouncement(),
      getActiveAds('home_bottom', undefined, 3),
    ]);

  return (
    <>
      {banner && (
        <AnnouncementBanner
          id={banner.id}
          title={banner.title}
          category={banner.category}
        />
      )}

      {/* =================================================================
          HERO — clean & minimalis (tanpa gradient, tanpa orb dekoratif).
          ================================================================= */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-24 text-center md:py-32">
          <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Platform Informasi Tuban · Gratis &amp; Terbuka
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Semua tentang Tuban,
            <br />
            dalam satu genggaman.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Temukan informasi layanan pemerintah, wisata, kuliner, dan jasa
            lokal Tuban — cepat, lengkap, dan terpercaya.
          </p>

          {/* Search form */}
          <form
            action="/search"
            method="get"
            className="mt-8 flex w-full max-w-lg items-center gap-2"
          >
            <label htmlFor="hero-search" className="sr-only">
              Cari informasi Tuban
            </label>
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Cari KTP, wisata, kuliner…"
                className="h-10 rounded-lg pl-9"
              />
            </div>
            <Button type="submit" size="lg" className="h-10 px-4">
              Cari
            </Button>
          </form>

          {/* Stats */}
          <p className="mt-6 text-sm text-muted-foreground">
            15+ Layanan · 10+ Destinasi · Gratis
          </p>
        </div>
      </section>

      {/* =================================================================
          CATEGORY
          ================================================================= */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground">
            Jelajahi Tuban
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pilih kategori yang kamu butuhkan
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Kategori belum tersedia. Pastikan schema database sudah dijalankan.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {categories.map((cat) => {
              const Icon = getIcon(cat.icon);
              const color = cat.color ?? '#2563EB';
              const count = counts[cat.id] ?? 0;
              return (
                <Link
                  key={cat.id}
                  href={`/${cat.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
                >
                  <Icon
                    className="h-5 w-5"
                    style={{ color }}
                    aria-hidden
                  />
                  <h3 className="mt-4 text-sm font-medium text-foreground">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  )}
                  <span className="mt-3 text-xs text-muted-foreground">
                    {count} item
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* =================================================================
          FEATURED BIROKRASI
          ================================================================= */}
      <section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Layanan Pemerintah
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Panduan administrasi kependudukan Tuban
              </p>
            </div>
            <Link
              href="/birokrasi"
              className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <ItemGrid
            items={birokrasiItems}
            emptyMessage="Belum ada layanan yang dipublikasikan."
          />
        </div>
      </section>

      {/* =================================================================
          FEATURED WISATA
          ================================================================= */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Destinasi Wisata
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Temukan keindahan Tuban
              </p>
            </div>
            <Link
              href="/wisata"
              className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
            >
              Lihat semua →
            </Link>
          </div>

          <ItemGrid
            items={wisataItems}
            variant="wisata"
            emptyMessage="Belum ada destinasi yang dipublikasikan."
          />
        </div>
      </section>

      {/* =================================================================
          KONTAK DARURAT — quick-access untuk warga
          ================================================================= */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Nomor Darurat
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Simpan dan bagikan — bisa menyelamatkan nyawa.
              </p>
            </div>
            <Link
              href="/pemerintah"
              className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
            >
              Semua kontak →
            </Link>
          </div>
          <EmergencyNumbers variant="compact" />
        </div>
      </section>

      {/* =================================================================
          IKLAN LOKAL — UMKM & layanan bersponsor
          ================================================================= */}
      {ads.length > 0 && (
        <section className="border-t border-border py-12">
          <div className="mx-auto w-full max-w-6xl space-y-4 px-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Disponsori UMKM Tuban
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dukung bisnis lokal yang ikut meramaikan Tuban.
                </p>
              </div>
              <Link
                href="/pasang-iklan"
                className="whitespace-nowrap text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Pasang iklan →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="card" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================
          HOW IT WORKS — nomor besar sebagai angka dekoratif
          ================================================================= */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground">
              Cara Menggunakan TubanHub
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tiga langkah sederhana untuk menemukan informasi yang kamu butuhkan
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                title: 'Cari Informasi',
                desc: 'Ketik kata kunci atau pilih kategori sesuai kebutuhanmu.',
              },
              {
                title: 'Baca Panduan',
                desc: 'Dapatkan informasi lengkap, syarat, dan prosedur secara detail.',
              },
              {
                title: 'Ambil Tindakan',
                desc: 'Hubungi langsung atau kunjungi lokasi dengan info yang jelas.',
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span
                  aria-hidden
                  className="text-6xl font-bold leading-none text-muted-foreground/30"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================================
          Banner kontribusi — simple, tidak mencolok
          ================================================================= */}
      <section className="bg-muted/50 py-4">
        <div className="mx-auto w-full max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <span>
            TubanHub adalah platform terbuka. Punya informasi untuk ditambahkan?{' '}
          </span>
          <Link
            href="/usul"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            Usulkan di sini <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
