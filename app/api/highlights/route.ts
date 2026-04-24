import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { parseHighlightPayload } from '@/lib/validators/highlight';

// POST /api/highlights — create highlight + sync highlight_tier/expiry pada listing.
export async function POST(request: Request) {
  const check = await getAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason === 'unauthenticated' ? 'unauthorized' : 'forbidden' },
      { status: check.reason === 'unauthenticated' ? 401 : 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = parseHighlightPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('highlights')
    .insert(parsed.payload)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Sync ke tabel listing (items atau influencers).
  const table = parsed.payload.listing_type === 'items' ? 'items' : 'influencers';
  await admin
    .from(table)
    .update({
      highlight_tier: parsed.payload.tier,
      highlight_expires_at: parsed.payload.expires_at,
    })
    .eq('id', parsed.payload.listing_id);

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
