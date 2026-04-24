import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseClaimPayload } from '@/lib/validators/claim';

// POST /api/claim-requests — publik (RLS: anyone can insert).
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const parsed = parseClaimPayload(body);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from('claim_requests').insert(parsed.payload);

  if (error) {
    console.warn('[claim-requests.POST]', error.message);
    return NextResponse.json({ error: 'gagal mengirim' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
