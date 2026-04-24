import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Guard sederhana — hanya terima UUID v4-ish format biar tidak gampang diabuse.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/items/[id]/view
// Increment view_count untuk item. Pakai service role karena kolom view_count
// di-protect RLS; write publik sengaja dibatasi ke endpoint ini saja.
export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ ok: false, error: 'invalid id' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    // Baca dulu biar tidak bentrok dengan race — acceptable karena ini counter
    // yang tidak perlu super-akurat. Skema juga menyediakan fungsi ideal
    // di masa depan; untuk sekarang pakai select+update.
    const { data: current, error: selectErr } = await admin
      .from('items')
      .select('view_count')
      .eq('id', id)
      .maybeSingle();

    if (selectErr || !current) {
      return NextResponse.json(
        { ok: false, error: 'item not found' },
        { status: 404 },
      );
    }

    const next = (current.view_count ?? 0) + 1;
    const { error: updateErr } = await admin
      .from('items')
      .update({ view_count: next })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json(
        { ok: false, error: updateErr.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, view_count: next });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
