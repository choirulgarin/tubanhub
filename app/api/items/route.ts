import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { parseItemPayload } from '@/lib/validators/item';

// GET /api/items — list dengan filter & pagination (admin-only).
// Query params:
//   category=<category slug>
//   status=published|draft
//   q=<title like>
//   page=<n> (1-based), pageSize=<n> (default 20, max 100)
export async function GET(request: Request) {
  const check = await getAdmin();
  if (!check.ok) {
    return NextResponse.json(
      { error: check.reason === 'unauthenticated' ? 'unauthorized' : 'forbidden' },
      { status: check.reason === 'unauthenticated' ? 401 : 403 },
    );
  }

  const url = new URL(request.url);
  const categorySlug = url.searchParams.get('category') ?? undefined;
  const status = url.searchParams.get('status') as
    | 'published'
    | 'draft'
    | null;
  const q = url.searchParams.get('q')?.trim() ?? '';
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(url.searchParams.get('pageSize') ?? '20') || 20),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createAdminClient();

  const baseCols =
    'id, title, slug, subcategory, is_published, is_verified, view_count, thumbnail_url, updated_at, created_at';

  // Pilih bentuk select (inner vs left join) di awal — chaining .select() di
  // tengah tidak didukung oleh types dari supabase-js.
  let query = categorySlug
    ? supabase
        .from('items')
        .select(
          `${baseCols}, category:categories!inner(id, name, slug, color)`,
          { count: 'exact' },
        )
        .eq('category.slug', categorySlug)
    : supabase
        .from('items')
        .select(
          `${baseCols}, category:categories(id, name, slug, color)`,
          { count: 'exact' },
        );

  if (status === 'published') query = query.eq('is_published', true);
  if (status === 'draft') query = query.eq('is_published', false);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(from, to);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  });
}

// POST /api/items — create baru (admin-only).
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

  const parsed = parseItemPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('items')
    .insert(parsed.payload)
    .select('id, slug')
    .single();

  if (error) {
    // Error kode 23505 = unique violation (slug bentrok).
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'Slug sudah dipakai item lain. Ubah slug terlebih dulu.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}

