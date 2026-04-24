import Link from 'next/link';
import { Tag, Check, X, HelpCircle, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { getPricingTiers } from '@/lib/queries';

export const revalidate = 600;

export const metadata = {
  title: 'Harga & Paket Highlight — TubanHub',
  description:
    'Paket highlight & featured listing untuk UMKM, wisata, jasa dan influencer Tuban. Transparan, tanpa kontrak.',
};

type MatrixRow = {
  label: string;
  free: boolean | string;
  basic: boolean | string;
  highlight: boolean | string;
  featured: boolean | string;
};

const MATRIX: MatrixRow[] = [
  { label: 'Listing di direktori', free: true, basic: true, highlight: true, featured: true },
  { label: 'Badge Terverifikasi (opsional)', free: true, basic: true, highlight: true, featured: true },
  { label: 'Analytics view dasar', free: false, basic: true, highlight: true, featured: true },
  { label: 'Analytics click & engagement', free: false, basic: false, highlight: true, featured: true },
  { label: 'Prioritas ringan di grid', free: false, basic: true, highlight: true, featured: true },
  { label: 'Border & badge "Unggulan"', free: false, basic: false, highlight: true, featured: true },
  { label: 'Border amber + Pin icon', free: false, basic: false, highlight: false, featured: true },
  { label: 'Featured di homepage', free: false, basic: false, highlight: true, featured: true },
  { label: 'Prioritas di search results', free: false, basic: false, highlight: false, featured: true },
  { label: 'Support prioritas', free: false, basic: false, highlight: false, featured: true },
];

const FAQ = [
  {
    q: 'Apa perbedaan Basic, Unggulan, dan Featured?',
    a: 'Basic memberi badge ringan dan prioritas kecil di grid. Unggulan menambah border biru dan posisi di atas listing reguler plus tampil di section Pilihan Unggulan homepage. Featured adalah paket premium dengan border amber, Pin icon, dan posisi paling atas.',
  },
  {
    q: 'Apakah ada kontrak minimum?',
    a: 'Tidak. Semua paket highlight bisa bulanan, dan bisa diaktifkan atau dihentikan kapan saja. Yang sudah berjalan tetap aktif sampai expiry-nya.',
  },
  {
    q: 'Bagaimana cara pembayaran?',
    a: 'Transfer bank atau QRIS. Setelah transfer, kirim bukti ke WhatsApp admin — highlight akan aktif paling lambat 1×24 jam.',
  },
  {
    q: 'Apa itu Klaim Profil?',
    a: 'Klaim Profil adalah cara bagi pemilik usaha untuk mengambil alih listing yang sudah tercatat di TubanHub. Sekali bayar, dapat badge Terverifikasi dan akses edit sendiri.',
  },
  {
    q: 'Apakah UMKM kecil juga bisa ikut?',
    a: 'Bisa — paket Basic dan Klaim kami buat dengan harga terjangkau khusus UMKM Tuban. Hubungi admin untuk diskusi paket yang cocok.',
  },
  {
    q: 'Apakah ada refund jika listing saya tidak ramai?',
    a: 'Kami tidak menjamin traffic. Yang dijamin adalah posisi tampilan sesuai paket. Namun admin akan bantu review isi listing agar lebih menarik.',
  },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === 'string') {
    return <span className="text-xs text-muted-foreground">{v}</span>;
  }
  return v ? (
    <Check className="h-4 w-4 text-emerald-600" aria-label="Termasuk" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/50" aria-label="Tidak termasuk" />
  );
}

export default async function PricingPage() {
  const tiers = await getPricingTiers();

  return (
    <>
      <PageHeader
        icon={Tag}
        color="#F59E0B"
        title="Harga & Paket Highlight"
        description="Paket berbayar membuat listing-mu lebih menonjol. Transparan, tanpa kontrak mengikat."
        breadcrumb={[{ label: 'Beranda', href: '/' }, { label: 'Harga' }]}
      />

      <section className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        {tiers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Paket harga belum tersedia. Jalankan migration{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              009_pricing.sql
            </code>{' '}
            untuk menginisialisasi.
          </div>
        ) : (
          <PricingToggle tiers={tiers} />
        )}
      </section>

      {/* Comparison table */}
      <section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Perbandingan lengkap
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fitur yang kamu dapatkan di setiap paket.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Fitur</th>
                  <th className="px-4 py-3 text-center font-medium">Gratis</th>
                  <th className="px-4 py-3 text-center font-medium">Basic</th>
                  <th className="px-4 py-3 text-center font-medium">Unggulan</th>
                  <th className="bg-amber-50/40 px-4 py-3 text-center font-medium text-amber-800">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground">{row.label}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Cell v={row.free} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Cell v={row.basic} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Cell v={row.highlight} />
                      </div>
                    </td>
                    <td className="bg-amber-50/40 px-4 py-3 text-center">
                      <div className="inline-flex items-center justify-center">
                        <Cell v={row.featured} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="mb-6 flex items-start gap-3">
            <div
              aria-hidden
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <HelpCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Pertanyaan umum
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Masih ragu? Ini yang sering ditanyakan.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-card">
            {FAQ.map((item, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/40">
                  <span>{item.q}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
                    aria-hidden
                  />
                </summary>
                <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            Masih bingung paket mana yang pas?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Diskusikan kebutuhanmu dengan admin — kami bantu pilih yang paling
            cocok untuk bisnis atau profil kontenmu.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Hubungi Admin
            </Link>
            <Link
              href="/klaim"
              className="inline-flex items-center gap-1 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
            >
              Ajukan Klaim Profil
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
