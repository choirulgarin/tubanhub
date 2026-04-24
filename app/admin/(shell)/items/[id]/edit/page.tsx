import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ItemForm } from '@/components/admin/ItemForm';
import { getCategories } from '@/lib/queries';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Item } from '@/types';

export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PageProps = { params: { id: string } };

export default async function AdminEditItemPage({ params }: PageProps) {
  if (!UUID_RE.test(params.id)) notFound();

  const supabase = createAdminClient();
  const [{ data: item, error }, categories] = await Promise.all([
    supabase
      .from('items')
      .select('*, category:categories(slug)')
      .eq('id', params.id)
      .maybeSingle(),
    getCategories(),
  ]);

  if (error || !item) notFound();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const categorySlug =
    (item as unknown as { category: { slug: string } | { slug: string }[] | null })
      .category;
  const publicSlug = Array.isArray(categorySlug)
    ? categorySlug[0]?.slug
    : categorySlug?.slug;
  const publicUrl =
    publicSlug && item.slug ? `/${publicSlug}/${item.slug}` : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/items"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar item
      </Link>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Edit Item
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Perbarui informasi <span className="font-medium">{item.title}</span>.
          </p>
        </div>
        {publicUrl && (
          <Link
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Lihat halaman publik
          </Link>
        )}
      </header>

      <ItemForm
        mode="edit"
        categories={categories}
        initial={item as Item}
        appUrl={appUrl}
      />
    </div>
  );
}
