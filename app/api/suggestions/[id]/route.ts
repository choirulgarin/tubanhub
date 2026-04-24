import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateSlug } from '@/lib/utils/slug';
import type { Suggestion, SuggestionStatus } from '@/types';

// PATCH /api/suggestions/[id] — admin-only.
// Body: { status: 'approved' | 'rejected' | 'pending', notes?: string }
//
// Side-effect: kalau status berubah ke 'approved', otomatis buat item draft
// dari data suggestion. Tidak otomatis publish — admin lanjut di /admin/items/[id]/edit.
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
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'payload invalid' }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const nextStatus = b.status;
  if (
    nextStatus !== 'pending' &&
    nextStatus !== 'approved' &&
    nextStatus !== 'rejected'
  ) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 });
  }
  const notes = typeof b.notes === 'string' ? b.notes.trim().slice(0, 2000) : null;

  const admin = createAdminClient();

  // Ambil suggestion dulu supaya kalau approve kita bisa pakai datanya.
  const { data: existing, error: fetchErr } = await admin
    .from('suggestions')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Suggestion>();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  // Update status + notes dulu.
  const { error: updateErr } = await admin
    .from('suggestions')
    .update({ status: nextStatus as SuggestionStatus, notes })
    .eq('id', params.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Hanya create draft item saat transisi ke approved (dan sebelumnya belum approved).
  let createdItemId: string | null = null;
  if (nextStatus === 'approved' && existing.status !== 'approved') {
    createdItemId = await createDraftItemFromSuggestion(existing);
  }

  return NextResponse.json({ ok: true, itemId: createdItemId });
}

async function createDraftItemFromSuggestion(s: Suggestion): Promise<string | null> {
  const admin = createAdminClient();

  // Resolve category_id dari slug yang disimpan di suggestion.
  let categoryId: string | null = null;
  if (s.category) {
    const { data: cat } = await admin
      .from('categories')
      .select('id')
      .eq('slug', s.category)
      .maybeSingle();
    categoryId = cat?.id ?? null;
  }

  // Kalau kategori tidak valid, fallback ke kategori 'jasa' sebagai tempat parkir.
  if (!categoryId) {
    const { data: fallback } = await admin
      .from('categories')
      .select('id')
      .eq('slug', 'jasa')
      .maybeSingle();
    categoryId = fallback?.id ?? null;
  }

  if (!categoryId) {
    console.warn('[suggestions.approve] no category resolvable — skip create');
    return null;
  }

  // Generate slug unik dengan suffix angka kalau bentrok.
  const baseSlug = generateSlug(s.name) || `usulan-${s.id.slice(0, 8)}`;
  const slug = await uniqueSlug(baseSlug);

  const contact = s.contact ?? null;
  const looksLikePhone = contact && /^[0-9+\-\s()]+$/.test(contact);

  const { data: inserted, error } = await admin
    .from('items')
    .insert({
      category_id: categoryId,
      title: s.name,
      slug,
      description: s.description,
      address: s.address,
      phone: looksLikePhone ? contact : null,
      whatsapp: looksLikePhone ? contact : null,
      website: contact && !looksLikePhone ? contact : null,
      is_published: false,
      is_verified: false,
      metadata: {
        source: 'user_suggestion',
        suggestion_id: s.id,
        submitted_by: s.submitted_by,
        submitted_contact: s.submitted_contact,
      },
    })
    .select('id')
    .single();

  if (error || !inserted) {
    console.warn('[suggestions.approve] create draft item failed:', error?.message);
    return null;
  }
  return inserted.id;
}

async function uniqueSlug(base: string): Promise<string> {
  const admin = createAdminClient();
  let candidate = base;
  for (let i = 1; i <= 10; i++) {
    const { data } = await admin
      .from('items')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}
