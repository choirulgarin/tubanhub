import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth/requireAdmin';

// PATCH — toggle is_active / update expiry.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const r = (body ?? {}) as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof r.is_active === 'boolean') update.is_active = r.is_active;
  if (typeof r.expires_at === 'string') {
    const d = new Date(r.expires_at);
    if (!isNaN(d.getTime())) update.expires_at = d.toISOString();
  }
  if (typeof r.payment_ref === 'string') {
    update.payment_ref = r.payment_ref.trim() || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: current, error: readErr } = await admin
    .from('highlights')
    .select('listing_type, listing_id, tier')
    .eq('id', params.id)
    .maybeSingle();
  if (readErr || !current) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const { error } = await admin
    .from('highlights')
    .update(update)
    .eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Jika dinon-aktifkan, reset tier listing ke 'none'.
  if (update.is_active === false) {
    const table = current.listing_type === 'items' ? 'items' : 'influencers';
    await admin
      .from(table)
      .update({ highlight_tier: 'none', highlight_expires_at: null })
      .eq('id', current.listing_id);
  }

  return NextResponse.json({ ok: true });
}

// DELETE — hapus highlight & reset tier listing.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const check = await getAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason === 'unauthenticated' ? 'unauthorized' : 'forbidden' },
      { status: check.reason === 'unauthenticated' ? 401 : 403 },
    );
  }

  const admin = createAdminClient();
  const { data: current } = await admin
    .from('highlights')
    .select('listing_type, listing_id')
    .eq('id', params.id)
    .maybeSingle();

  const { error } = await admin.from('highlights').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (current) {
    const table = current.listing_type === 'items' ? 'items' : 'influencers';
    await admin
      .from(table)
      .update({ highlight_tier: 'none', highlight_expires_at: null })
      .eq('id', current.listing_id);
  }

  return NextResponse.json({ ok: true });
}
