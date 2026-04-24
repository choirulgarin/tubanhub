import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Category, ItemWithCategory, SearchResult } from '@/types';

// Query helpers server-side. Menelan error agar UI bisa graceful fallback
// (return array kosong) saat DB belum siap / tabel belum di-migrate.

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.warn('[getCategories]', error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

// Hitung jumlah item published per kategori (dipakai di category card).
export async function getCategoryCounts(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select('category_id')
    .eq('is_published', true);

  if (error || !data) return {};
  return data.reduce<Record<string, number>>((acc, row) => {
    acc[row.category_id] = (acc[row.category_id] ?? 0) + 1;
    return acc;
  }, {});
}

// Ambil featured item berdasarkan slug kategori.
// `!inner` memastikan hanya item yang kategorinya match yang dikembalikan.
export async function getFeaturedItems(
  categorySlug: string,
  limit = 3,
): Promise<ItemWithCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories!inner(name, slug, color, icon)')
    .eq('is_published', true)
    .eq('category.slug', categorySlug)
    .order('is_verified', { ascending: false })
    .order('view_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getFeaturedItems:${categorySlug}]`, error.message);
    return [];
  }
  return (data ?? []) as ItemWithCategory[];
}

// Ambil semua item published untuk sebuah kategori.
// Parameter `subcategory` (opsional) memfilter berdasar kolom subcategory.
export async function getItemsByCategory(
  categorySlug: string,
  subcategory?: string,
): Promise<ItemWithCategory[]> {
  const supabase = createClient();
  let query = supabase
    .from('items')
    .select('*, category:categories!inner(name, slug, color, icon)')
    .eq('is_published', true)
    .eq('category.slug', categorySlug);

  if (subcategory && subcategory.trim() !== '') {
    query = query.eq('subcategory', subcategory);
  }

  const { data, error } = await query
    .order('is_verified', { ascending: false })
    .order('view_count', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn(`[getItemsByCategory:${categorySlug}]`, error.message);
    return [];
  }
  return (data ?? []) as ItemWithCategory[];
}

// Ambil daftar unik subcategory untuk sebuah kategori — dipakai untuk tab/filter.
export async function getSubcategoriesForCategory(
  categorySlug: string,
): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select('subcategory, category:categories!inner(slug)')
    .eq('is_published', true)
    .eq('category.slug', categorySlug)
    .not('subcategory', 'is', null);

  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data as Array<{ subcategory: string | null }>) {
    if (row.subcategory) set.add(row.subcategory);
  }
  return Array.from(set).sort();
}

// Ambil satu item by kategori slug + item slug — untuk halaman detail.
export async function getItemByCategoryAndSlug(
  categorySlug: string,
  itemSlug: string,
): Promise<ItemWithCategory | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories!inner(name, slug, color, icon)')
    .eq('is_published', true)
    .eq('slug', itemSlug)
    .eq('category.slug', categorySlug)
    .maybeSingle();

  if (error) {
    console.warn(`[getItemByCategoryAndSlug:${categorySlug}/${itemSlug}]`, error.message);
    return null;
  }
  return (data as ItemWithCategory | null) ?? null;
}

// Daftar pasangan (kategori slug, item slug) untuk generateStaticParams.
// Memakai admin client karena generateStaticParams dipanggil di build time
// (di luar request scope) sehingga cookies() dari server client tidak tersedia.
export async function getPublishedItemSlugs(): Promise<
  Array<{ category: string; slug: string }>
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('items')
    .select('slug, category:categories!inner(slug)')
    .eq('is_published', true);

  if (error || !data) return [];
  // Supabase mengetik kolom relasi sebagai array atau objek — normalisasi di sini.
  const rows = data as unknown as Array<{
    slug: string;
    category: { slug: string } | { slug: string }[] | null;
  }>;
  const out: Array<{ category: string; slug: string }> = [];
  for (const row of rows) {
    const cat = Array.isArray(row.category) ? row.category[0] : row.category;
    if (cat?.slug) out.push({ category: cat.slug, slug: row.slug });
  }
  return out;
}

// Item terkait — kategori yang sama, exclude current item.
export async function getRelatedItems(
  categoryId: string,
  excludeId: string,
  limit = 3,
): Promise<ItemWithCategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories(name, slug, color, icon)')
    .eq('is_published', true)
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('is_verified', { ascending: false })
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[getRelatedItems]', error.message);
    return [];
  }
  return (data ?? []) as ItemWithCategory[];
}

// Pencarian menggunakan kombinasi ilike (title/description/address) + contains (tags).
// Hasil di-normalize ke bentuk SearchResult agar kompatibel dengan UI existing.
export async function searchItemsQuery(q: string): Promise<SearchResult[]> {
  const query = q.trim();
  if (!query) return [];

  // PostgREST `.or(...)` terpisah dengan koma, nilai pencarian tidak boleh mengandung
  // koma/parentheses mentah — sanitasi sederhana.
  const safe = query.replace(/[,()]/g, ' ').trim();
  if (!safe) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from('items')
    .select(
      'id, category_id, title, slug, subcategory, description, thumbnail_url, address, district, tags, is_verified, view_count, category:categories!inner(name, slug, color, icon)',
    )
    .eq('is_published', true)
    .or(
      [
        `title.ilike.%${safe}%`,
        `description.ilike.%${safe}%`,
        `address.ilike.%${safe}%`,
        `tags.cs.{${safe}}`,
      ].join(','),
    )
    .order('is_verified', { ascending: false })
    .order('view_count', { ascending: false })
    .limit(60);

  if (error) {
    console.warn('[searchItemsQuery]', error.message);
    return [];
  }

  type Row = {
    id: string;
    category_id: string;
    title: string;
    slug: string;
    subcategory: string | null;
    description: string | null;
    thumbnail_url: string | null;
    address: string | null;
    district: string | null;
    tags: string[] | null;
    is_verified: boolean;
    view_count: number;
    category:
      | { name: string; slug: string; color: string | null; icon: string | null }
      | Array<{ name: string; slug: string; color: string | null; icon: string | null }>
      | null;
  };

  const rows = (data ?? []) as unknown as Row[];
  return rows.map((r) => {
    const cat = Array.isArray(r.category) ? r.category[0] : r.category;
    return {
      id: r.id,
      category_id: r.category_id,
      category_name: cat?.name ?? '',
      category_slug: cat?.slug ?? '',
      category_color: cat?.color ?? null,
      category_icon: cat?.icon ?? null,
      subcategory: r.subcategory,
      title: r.title,
      slug: r.slug,
      description: r.description,
      thumbnail_url: r.thumbnail_url,
      address: r.address,
      district: r.district,
      tags: r.tags ?? [],
      is_verified: r.is_verified,
      rank: r.view_count,
    };
  });
}
