import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';

// Rate-limit sangat sederhana berbasis in-memory (best effort untuk Node runtime).
// Bila deploy ke edge/multi-instance, ganti dengan Upstash / Redis.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(key, arr);
    return false;
  }
  arr.push(now);
  hits.set(key, arr);
  return true;
}

// POST /api/suggestions — terima usulan tempat dari publik.
// Body: { name, category?, address?, description?, contact?, submitted_by? }
export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Terlalu banyak usulan. Coba lagi sebentar lagi.' },
      { status: 429 },
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

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) {
    return NextResponse.json(
      { error: 'Nama tempat/layanan wajib diisi.' },
      { status: 400 },
    );
  }
  if (name.length > 200) {
    return NextResponse.json(
      { error: 'Nama terlalu panjang (maks 200 karakter).' },
      { status: 400 },
    );
  }

  const payload = {
    name,
    category: strOrNull(b.category, 80),
    address: strOrNull(b.address, 300),
    description: strOrNull(b.description, 2000),
    contact: strOrNull(b.contact, 120),
    submitted_by: strOrNull(b.submitted_by, 120),
  };

  // Pakai anon client — policy "Anyone can submit suggestions" mengizinkan insert.
  const supabase = createClient();
  const { error } = await supabase.from('suggestions').insert(payload);

  if (error) {
    console.warn('[suggestions.insert]', error.message);
    return NextResponse.json({ error: 'Gagal menyimpan usulan.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// GET /api/suggestions — admin-only. Dukung filter status + pagination sederhana.
export async function GET(request: Request) {
  const check = await getAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason === 'unauthenticated' ? 'unauthorized' : 'forbidden' },
      { status: check.reason === 'unauthenticated' ? 401 : 403 },
    );
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = createAdminClient();
  let query = admin.from('suggestions').select('*', { count: 'exact' });
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query = query.eq('status', status);
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    suggestions: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  });
}

function strOrNull(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}
