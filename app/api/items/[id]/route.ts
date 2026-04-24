import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { parseItemPayload } from '@/lib/validators/item';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function guardId(id: string) {
  return UUID_RE.test(id);
}

async function requireAuth() {
  const check = await getAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason === 'unauthenticated' ? 'unauthorized' : 'forbidden' },
      { status: check.reason === 'unauthenticated' ? 401 : 403 },
    );
  }
  return null;
}

// GET /api/items/[id] — admin-only (dipakai page edit kalau butuh refetch).
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  if (!guardId(params.id))
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('items')
    .select('*, category:categories(name, slug, color, icon)')
    .eq('id', params.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });

  return NextResponse.json({ item: data });
}

// PUT /api/items/[id] — update penuh (full replace fields yang valid).
// Mendukung PATCH semu: kalau client hanya kirim subset { is_published }, helper
// parse mewajibkan title+category_id — jadi halaman list panggil endpoint khusus di bawah.
export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  if (!guardId(params.id))
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Dukungan PATCH ringan: kalau body hanya berisi toggle field, terima.
  if (isTogglePayload(body)) {
    const admin = createAdminClient();
    const { error } = await admin
      .from('items')
      .update(body as Record<string, unknown>)
      .eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const parsed = parseItemPayload(body);
  if ('error' in parsed)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from('items')
    .update(parsed.payload)
    .eq('id', params.id);

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'Slug sudah dipakai item lain.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/items/[id] — admin-only.
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const unauth = await requireAuth();
  if (unauth) return unauth;
  if (!guardId(params.id))
    return NextResponse.json({ error: 'invalid id' }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from('items').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Body dianggap toggle-only kalau hanya terdiri dari kolom-kolom whitelist kecil.
function isTogglePayload(body: unknown): boolean {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  const keys = Object.keys(body as Record<string, unknown>);
  if (keys.length === 0) return false;
  const allowed = new Set(['is_published', 'is_verified']);
  return keys.every((k) => allowed.has(k));
}
