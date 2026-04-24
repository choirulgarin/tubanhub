import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { error } = await supabase.rpc('increment_event_view', {
    evt_id: params.id,
  });

  if (error) {
    console.warn('[event.view]', error.message);
  }
  return NextResponse.json({ ok: true });
}
