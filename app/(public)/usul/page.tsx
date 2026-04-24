import type { Metadata } from 'next';
import { MessageSquarePlus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { SuggestionForm } from '@/components/SuggestionForm';
import { getCategories } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Usulkan Tempat',
  description:
    'Punya rekomendasi tempat atau layanan di Tuban yang belum ada di TubanHub? Kirim usulan agar kami bisa menambahkannya.',
  alternates: { canonical: '/usul' },
};

export const dynamic = 'force-dynamic';

export default async function UsulPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Usulkan Tempat"
        description="Bantu kami melengkapi data Tuban. Isi form di bawah — tim editor akan meninjau sebelum dipublikasikan."
        icon={MessageSquarePlus}
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Usulkan Tempat' },
        ]}
      />

      <section className="mx-auto w-full max-w-lg space-y-6 px-4 py-10">
        <Alert>
          <Info />
          <AlertDescription>
            Usulan akan direview dalam{' '}
            <span className="font-medium text-foreground">1-3 hari kerja</span>.
            Jika lolos verifikasi, tempat/layanan Anda akan ditambahkan ke
            TubanHub.
          </AlertDescription>
        </Alert>

        <SuggestionForm categories={categories} />
      </section>
    </>
  );
}
