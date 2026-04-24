import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ItemForm } from '@/components/admin/ItemForm';
import { getCategories } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AdminNewItemPage() {
  const categories = await getCategories();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  return (
    <div className="space-y-6">
      <Link
        href="/admin/items"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar item
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Tambah Item Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi detail lengkap layanan, destinasi, atau tempat yang ingin
          dipublikasikan di TubanHub.
        </p>
      </header>

      <ItemForm mode="create" categories={categories} appUrl={appUrl} />
    </div>
  );
}
