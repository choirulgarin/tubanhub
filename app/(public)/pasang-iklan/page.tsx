import Link from 'next/link';
import type { Metadata } from 'next';
import { Sparkles, MapPin, Users, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Pasang Iklan di TubanHub — Dukungan untuk UMKM Tuban',
  description:
    'Promosikan usahamu di TubanHub — platform informasi #1 warga Tuban. Cocok untuk UMKM, kuliner, jasa, dan event lokal.',
  alternates: { canonical: '/pasang-iklan' },
};

const TIERS = [
  {
    name: 'Sisipan Kategori',
    price: 'Rp 150.000',
    period: '/ 30 hari',
    description:
      'Muncul di atas daftar kategori yang relevan (kuliner/jasa/wisata/birokrasi).',
    features: [
      'Placement "Atas Kategori"',
      'Target 1 kategori',
      'Teks + gambar + tautan',
      'Laporan impression & klik',
    ],
    highlight: false,
  },
  {
    name: 'Banner Beranda',
    price: 'Rp 350.000',
    period: '/ 30 hari',
    description:
      'Tampil di section "Disponsori UMKM Tuban" di halaman utama.',
    features: [
      'Placement beranda (paling banyak dilihat)',
      'Tampil di semua kategori',
      'Prioritas urutan',
      'Laporan lengkap + konsultasi kreatif',
    ],
    highlight: true,
  },
  {
    name: 'Kampanye Khusus',
    price: 'Kustom',
    period: '',
    description:
      'Untuk event besar, launching toko, atau campaign musiman. Hubungi untuk detail.',
    features: [
      'Placement multi-slot',
      'Desain dibantu tim',
      'Laporan mingguan',
      'Bisa kombinasi pengumuman',
    ],
    highlight: false,
  },
];

export default function PasangIklanPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:py-16">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Untuk UMKM & Pengusaha Tuban
        </div>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Promosikan usahamu di
          <br />
          TubanHub
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          TubanHub adalah platform informasi #1 untuk warga Tuban. Ribuan orang
          mengakses setiap hari untuk cari kuliner, jasa, wisata, dan layanan
          pemerintah. Slot iklan lokal membantu usahamu ditemukan warga yang
          tepat — dengan harga yang ramah UMKM.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: '10.000+', desc: 'pengunjung / bulan' },
          { icon: MapPin, label: 'Hyperlocal', desc: 'fokus warga Tuban' },
          { icon: MessageSquare, label: 'Didukung', desc: 'tim kreatif lokal' },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
          >
            <s.icon className="h-6 w-6 text-primary" aria-hidden />
            <div>
              <p className="text-lg font-semibold text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Paket iklan
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pilih paket yang paling cocok untuk kebutuhanmu.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={
                'flex flex-col rounded-xl border p-6 ' +
                (t.highlight
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card')
              }
            >
              {t.highlight && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  Paling populer
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">
                {t.name}
              </h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-2xl font-semibold text-foreground">
                  {t.price}
                </span>
                <span className="pb-0.5 text-xs text-muted-foreground">
                  {t.period}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {t.description}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Tertarik pasang iklan?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Kirim info singkat tentang usahamu lewat halaman kontak — tim kami
          akan follow-up maks 1×24 jam kerja.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/kontak">Hubungi Tim Iklan</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/usul">Usulkan Tempat (Gratis)</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
