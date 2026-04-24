import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { InfluencerForm } from '@/components/admin/InfluencerForm';
import type { Influencer } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditInfluencerPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('influencers')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.warn('[admin/influencers/edit]', error.message);
  }
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/influencers"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Semua Influencer
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Edit Influencer
        </h1>
      </div>

      <InfluencerForm mode="edit" initial={data as Influencer} />
    </div>
  );
}
