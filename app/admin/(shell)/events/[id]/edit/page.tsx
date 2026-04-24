import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { EventForm } from '@/components/admin/EventForm';
import type { EventItem } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();
  const [{ data: event, error }, { data: communities }] = await Promise.all([
    admin.from('events').select('*').eq('id', params.id).maybeSingle(),
    admin.from('communities').select('id, name').order('name'),
  ]);

  if (error) {
    console.warn('[admin/events/edit]', error.message);
  }
  if (!event) notFound();

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
          Edit Event
        </h1>
      </div>

      <EventForm
        mode="edit"
        initial={event as EventItem}
        communities={(communities ?? []) as Array<{ id: string; name: string }>}
      />
    </div>
  );
}
