import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { parseAnnouncementPayload } from '@/lib/validators/announcement';

// PATCH /api/announcements/[id] — update (admin-only).
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

  const parsed = parseAnnouncementPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const admin = createAdminClient();

  // Kalau baru di-publish tapi belum ada published_at, set ke sekarang.
  const payload = { ...parsed.payload };
  if (payload.is_published && !payload.published_at) {
    const { data: existing } = await admin
      .from('announcements')
      .select('published_at, is_published')
      .eq('id', params.id)
      .maybeSingle<{ published_at: string | null; is_published: boolean }>();
    if (!existing?.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }

  const { error } = await admin
    .from('announcements')
    .update(payload)
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/announcements/[id] — hapus (admin-only).
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
  const { error } = await admin
    .from('announcements')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
