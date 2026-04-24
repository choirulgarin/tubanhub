import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Building2,
  FileText,
  Megaphone,
  ArrowRight,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { EmergencyNumbers } from '@/components/EmergencyNumbers';

export const metadata: Metadata = {
  title: 'Pemerintah Kabupaten Tuban — Struktur, Layanan & Kontak — TubanHub',
  description:
    'Informasi pemerintahan Kabupaten Tuban: struktur, dinas, layanan administrasi, kontak darurat, dan tautan situs resmi.',
  alternates: { canonical: '/pemerintah' },
};

const LAYANAN_LINKS = [
  {
    title: 'Administrasi Kependudukan',
    description:
      'KTP, KK, akta, pindah datang — panduan persyaratan dan alur.',
    href: '/birokrasi',
    icon: FileText,
  },
  {
    title: 'Pengumuman & Imbauan',
    description:
      'Info terkini soal bencana, kesehatan, dan infrastruktur di Tuban.',
    href: '/pengumuman',
    icon: Megaphone,
  },
];

// Kantor & dinas utama di Tuban — link keluar ke situs/website resmi.
const KANTOR = [
  {
    name: 'Pemkab Tuban',
    url: 'https://tubankab.go.id',
    description: 'Portal resmi Pemerintah Kabupaten Tuban',
  },
  {
    name: 'DPMPTSP Tuban',
    url: 'https://dpmptsp.tubankab.go.id',
    description: 'Penanaman Modal & Pelayanan Terpadu Satu Pintu',
  },
  {
    name: 'Dispendukcapil',
    url: 'https://dispendukcapil.tubankab.go.id',
    description: 'Kependudukan & Pencatatan Sipil',
  },
  {
    name: 'Dinas Kesehatan',
    url: 'https://dinkes.tubankab.go.id',
    description: 'Informasi faskes, puskesmas, & program kesehatan',
  },
  {
    name: 'Dinas Pendidikan',
    url: 'https://dispendik.tubankab.go.id',
    description: 'Layanan pendidikan & info sekolah',
  },
  {
    name: 'Diskominfo',
    url: 'https://kominfo.tubankab.go.id',
    description: 'Komunikasi, informatika, & humas daerah',
  },
];

export default function PemerintahPage() {
  return (
    <>
      <PageHeader
        title="Pemerintah Kabupaten Tuban"
        description="Informasi struktur pemerintahan, layanan administrasi, dan kontak darurat untuk warga Tuban."
        icon={Building2}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Pemerintah' },
        ]}
      />

      <section className="mx-auto w-full max-w-5xl space-y-14 px-4 py-12">
        {/* LAYANAN */}
        <div className="space-y-5">
          <header>
            <h2 className="text-lg font-semibold text-foreground">
              Layanan & Informasi
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mulai dari sini untuk menemukan panduan layanan yang kamu
              butuhkan.
            </p>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {LAYANAN_LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
                >
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary">
                      {l.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {l.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* KONTAK DARURAT */}
        <div className="space-y-5">
          <header>
            <h2 className="text-lg font-semibold text-foreground">
              Kontak Darurat
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap nomor untuk langsung menelepon. Gunakan dalam keadaan darurat
              saja.
            </p>
          </header>
          <EmergencyNumbers />
        </div>

        {/* KANTOR / DINAS */}
        <div className="space-y-5">
          <header>
            <h2 className="text-lg font-semibold text-foreground">
              Kantor & Dinas Utama
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tautan ke situs resmi dinas terkait di Pemkab Tuban.
            </p>
          </header>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {KANTOR.map((k) => (
              <a
                key={k.url}
                href={k.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary">
                    {k.name}
                  </h3>
                  <ExternalLink
                    className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary"
                    aria-hidden
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {k.description}
                </p>
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Tautan dinas di atas keluar ke situs resmi Pemkab Tuban. TubanHub
            hanya mengkurasi referensi — untuk kepastian data terkini silakan
            konfirmasi langsung ke kantor terkait.
          </p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-border bg-muted/30 p-6 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            Butuh panduan layanan administrasi?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Lihat daftar layanan birokrasi Tuban — lengkap dengan syarat,
            alur, dan biaya.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/birokrasi">
                <FileText className="h-4 w-4" aria-hidden />
                Lihat Layanan Birokrasi
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/kontak">
                <Phone className="h-4 w-4" aria-hidden />
                Hubungi TubanHub
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
