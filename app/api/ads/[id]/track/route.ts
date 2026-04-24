import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/ads/[id]/track — track impression atau click.
// Body: { metric: 'impression' | 'click' }
// Publik; RLS di-pass via RPC SECURITY DEFINER.
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const metric = (body as { metric?: string } | null)?.metric;
  if (metric !== 'impression' && metric !== 'click') {
    return NextResponse.json({ error: 'invalid metric' }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.rpc('increment_ad_metric', {
    ad_id: params.id,
    metric,
  });

  if (error) {
    // Fail open — jangan blokir UX user kalau tracking gagal.
    console.warn('[ads.track]', error.message);
  }

  return NextResponse.json({ ok: true });
}
