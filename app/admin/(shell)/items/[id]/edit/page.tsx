import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ItemForm } from '@/components/admin/ItemForm';
import { Button } from '@/components/ui/button';
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
  const categorySlug = (
    item as unknown as {
      category: { slug: string } | { slug: string }[] | null;
    }
  ).category;
  const publicSlug = Array.isArray(categorySlug)
    ? categorySlug[0]?.slug
    : categorySlug?.slug;
  const publicUrl =
    publicSlug && item.slug ? `/${publicSlug}/${item.slug}` : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/items"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar item
      </Link>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Edit Item
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Perbarui informasi{' '}
            <span className="font-medium text-foreground">{item.title}</span>.
          </p>
        </div>
        {publicUrl && (
          <Button asChild size="sm" variant="outline">
            <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Lihat halaman publik
            </Link>
          </Button>
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
