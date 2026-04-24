import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/queries';

// GET /api/categories — daftar kategori aktif, diurutkan berdasar order_index.
// Publik (tidak butuh auth). Dipakai misalnya oleh form usulan tempat.
export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ categories });
}
