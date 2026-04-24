import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { HighlightForm, type ListingOption } from '@/components/admin/HighlightForm';

export const dynamic = 'force-dynamic';

export default async function NewHighlightPage() {
  const admin = createAdminClient();

  const [itemsRes, infRes] = await Promise.all([
    admin
      .from('items')
      .select('id, title, category:categories!inner(slug)')
      .eq('is_published', true)
      .order('title', { ascending: true })
      .limit(500),
    admin
      .from('influencers')
      .select('id, name')
      .eq('is_published', true)
      .order('name', { ascending: true })
      .limit(500),
  ]);

  type ItemRow = {
    id: string;
    title: string;
    category: { slug: string } | { slug: string }[] | null;
  };
  const itemOptions: ListingOption[] = ((itemsRes.data ?? []) as ItemRow[]).map(
    (r) => {
      const cat = Array.isArray(r.category) ? r.category[0] : r.category;
      return {
        id: r.id,
        label: r.title,
        category_slug: cat?.slug ?? null,
      };
    },
  );

  const influencerOptions: ListingOption[] = (
    (infRes.data ?? []) as Array<{ id: string; name: string }>
  ).map((r) => ({ id: r.id, label: r.name }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/highlights"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Highlights
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Highlight Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih listing, tier, dan durasi. Tier listing di-sync otomatis.
        </p>
      </div>
      <HighlightForm
        itemOptions={itemOptions}
        influencerOptions={influencerOptions}
      />
    </div>
  );
}
