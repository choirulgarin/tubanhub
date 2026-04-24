import type { Metadata } from 'next';
import { MessageSquarePlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SuggestionForm } from '@/components/SuggestionForm';
import { getCategories } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Usulkan Tempat',
  description:
    'Punya rekomendasi tempat atau layanan di Tuban yang belum ada di TubanHub? Kirim usulan agar kami bisa menambahkannya.',
  alternates: { canonical: '/usul' },
};

// Halaman form usulan tempat. Server component yang mengambil kategori,
// lalu menyerahkan ke client form component.
export const dynamic = 'force-dynamic';

export default async function UsulPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Usulkan Tempat"
        description="Bantu kami melengkapi data Tuban. Isi form di bawah — tim editor akan meninjau sebelum dipublikasikan."
        icon={MessageSquarePlus}
        color="#7C3AED"
        breadcrumb={[
          { label: 'Beranda', href: '/' },
          { label: 'Usulkan Tempat' },
        ]}
      />

      <section className="section">
        <div className="container-app grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SuggestionForm categories={categories} />
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-card">
              <h2 className="text-sm font-semibold text-slate-900">
                Tips mengisi form
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                <li>• Tulis nama tempat/layanan sejelas mungkin.</li>
                <li>• Sertakan alamat atau kelurahan agar mudah dicari.</li>
                <li>
                  • Jelaskan secara singkat apa yang menarik dari tempat ini.
                </li>
                <li>
                  • Kontak Anda dipakai hanya bila editor perlu verifikasi.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-xs text-slate-600">
              <p>
                Usulan Anda disimpan sebagai <em>pending</em> dan tidak langsung
                tampil. Tim akan memverifikasi dalam beberapa hari kerja.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
