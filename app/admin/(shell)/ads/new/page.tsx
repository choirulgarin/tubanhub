import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdForm } from '@/components/admin/AdForm';
import { getCategories } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminNewAdPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/ads"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar iklan
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Iklan Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur konten, placement, dan jadwal tayang iklan.
        </p>
      </header>

      <AdForm mode="create" categories={categories} />
    </div>
  );
}
