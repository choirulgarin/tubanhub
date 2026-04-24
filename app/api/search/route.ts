import { NextResponse } from 'next/server';
import { searchItemsQuery } from '@/lib/queries';

// GET /api/search?q=<query>
// Endpoint JSON untuk pencarian (dipakai client jika butuh fetch dinamis).
// Halaman /search sendiri memakai helper langsung di server component.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';
  const trimmed = q.trim();

  if (!trimmed) {
    return NextResponse.json({ query: '', total: 0, results: [] });
  }

  const results = await searchItemsQuery(trimmed);
  return NextResponse.json({
    query: trimmed,
    total: results.length,
    results,
  });
}
