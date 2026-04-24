import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate-limit sederhana in-memory — best effort untuk runtime Node.
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

// POST /api/contacts — terima pesan "Hubungi Kami" dari publik.
// Body: { name, email?, message }
export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: 'Terlalu banyak pesan. Coba lagi sebentar.' },
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
  const message = typeof b.message === 'string' ? b.message.trim() : '';
  const emailRaw = typeof b.email === 'string' ? b.email.trim() : '';
  const email = emailRaw || null;

  if (!name) {
    return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: 'Pesan wajib diisi.' }, { status: 400 });
  }
  if (name.length > 120) {
    return NextResponse.json(
      { error: 'Nama terlalu panjang (maks 120 karakter).' },
      { status: 400 },
    );
  }
  if (message.length > 4000) {
    return NextResponse.json(
      { error: 'Pesan terlalu panjang (maks 4000 karakter).' },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Format email tidak valid.' },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('contacts')
    .insert({ name, email, message });

  if (error) {
    console.warn('[contacts.insert]', error.message);
    return NextResponse.json(
      { error: 'Gagal mengirim pesan.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
