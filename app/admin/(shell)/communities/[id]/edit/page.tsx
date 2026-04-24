import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { CommunityForm } from '@/components/admin/CommunityForm';
import type { Community } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditCommunityPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('communities')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.warn('[admin/communities/edit]', error.message);
  }
  if (!data) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/communities"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Semua Komunitas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Edit Komunitas
        </h1>
      </div>

      <CommunityForm mode="edit" initial={data as Community} />
    </div>
  );
}
