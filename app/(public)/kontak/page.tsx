import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ContactForm } from '@/components/ContactForm';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Hubungi Kami — TubanHub',
  description:
    'Hubungi tim TubanHub — kirim pesan, saran, koreksi data, atau ajakan kerja sama.',
  alternates: { canonical: '/kontak' },
};

export default function KontakPage() {
  return (
    <>
      <PageHeader
        title="Hubungi Kami"
        description="Punya pertanyaan, saran, atau ingin bekerja sama? Kirim pesan — tim TubanHub akan menindaklanjuti."
        icon={MessageCircle}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Hubungi Kami' },
        ]}
      />

      <section className="mx-auto w-full max-w-lg space-y-8 px-4 py-10">
        <ContactForm />

        <Separator />

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Email:</span>{' '}
            <a
              href="mailto:halo@tubanhub.id"
              className="hover:text-foreground hover:underline"
            >
              halo@tubanhub.id
            </a>
          </p>
          <p>
            <span className="font-medium text-foreground">Lokasi:</span>{' '}
            Kabupaten Tuban, Jawa Timur
          </p>
          <p className="pt-2 text-xs leading-relaxed">
            Untuk koreksi data layanan atau destinasi tertentu, mohon
            sertakan nama tempat dan tautannya supaya lebih cepat kami
            tindak lanjuti.
          </p>
        </div>
      </section>
    </>
  );
}
