import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { EventForm } from '@/components/admin/EventForm';

export const dynamic = 'force-dynamic';

export default async function NewEventPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from('communities')
    .select('id, name')
    .order('name');
  const communities = (data ?? []) as Array<{ id: string; name: string }>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Semua Event
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Tambah Event
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi detail event yang akan tampil di agenda publik.
        </p>
      </div>

      <EventForm mode="create" communities={communities} />
    </div>
  );
}
