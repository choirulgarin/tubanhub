import type { Metadata } from 'next';
import { BadgeCheck, ShieldCheck, Edit3, Lock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ClaimForm } from '@/components/ClaimForm';

export const metadata: Metadata = {
  title: 'Klaim Listing — TubanHub',
  description:
    'Klaim kepemilikan listing bisnis atau profil kamu di TubanHub. Dapatkan badge Owner Verified dan hak edit informasi.',
  alternates: { canonical: '/klaim' },
};

const BENEFITS = [
  { icon: BadgeCheck, title: 'Badge Owner Verified', desc: 'Centang biru khusus pemilik terverifikasi.' },
  { icon: Edit3, title: 'Hak Edit Info', desc: 'Update jam buka, kontak, dan foto kapan saja.' },
  { icon: ShieldCheck, title: 'Kontrol Penuh', desc: 'Atur sendiri informasi yang tampil ke publik.' },
  { icon: Lock, title: 'Pembayaran Aman', desc: 'Satu kali bayar, bukan langganan.' },
];

export default function KlaimPage() {
  return (
    <>
      <PageHeader
        title="Klaim Listing Kamu"
        description="Ajukan klaim untuk mendapatkan hak edit listing bisnis atau profil influencer kamu di TubanHub."
        icon={BadgeCheck}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Klaim Listing' },
        ]}
      />

      <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-10 md:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Kenapa klaim listing?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Jika listing kamu sudah ada di TubanHub, kamu bisa mengklaimnya
              untuk mendapatkan akses edit, badge Owner Verified, dan kontrol
              penuh atas informasi yang tampil ke publik.
            </p>
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <li
                  key={b.title}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Biaya Klaim
            </h3>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              Rp 50.000 – Rp 100.000
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pembayaran satu kali. Biaya bergantung pada popularitas dan
              kategori listing. Terpisah dari paket berlangganan TubanHub.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Form Pengajuan Klaim
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tim TubanHub akan verifikasi dan menghubungi kamu dalam 1-3 hari
            kerja.
          </p>
          <div className="mt-5">
            <ClaimForm />
          </div>
        </div>
      </section>
    </>
  );
}
