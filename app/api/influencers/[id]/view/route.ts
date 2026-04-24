import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/influencers/[id]/view — increment view counter.
// Publik. RLS di-bypass via RPC SECURITY DEFINER.
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { error } = await supabase.rpc('increment_influencer_view', {
    inf_id: params.id,
  });

  if (error) {
    console.warn('[influencer.view]', error.message);
  }
  return NextResponse.json({ ok: true });
}
