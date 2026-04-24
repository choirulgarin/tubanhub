import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdForm } from '@/components/admin/AdForm';
import { getCategories } from '@/lib/queries';
import type { Ad } from '@/types';

export const dynamic = 'force-dynamic';

type PageProps = { params: { id: string } };

export default async function AdminEditAdPage({ params }: PageProps) {
  const admin = createAdminClient();
  const [categories, { data }] = await Promise.all([
    getCategories(),
    admin.from('ads').select('*').eq('id', params.id).maybeSingle<Ad>(),
  ]);

  if (!data) notFound();

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
          Edit Iklan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.title}</p>
      </header>

      <AdForm mode="edit" categories={categories} initial={data} />
    </div>
  );
}
