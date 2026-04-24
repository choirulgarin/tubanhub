import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  Ad,
  AdPlacement,
  Announcement,
  Category,
  Community,
  CommunityCategory,
  EventItem,
  EventWithCommunity,
  Influencer,
  ItemWithCategory,
  PricingConfig,
  SearchResult,
} from '@/types';

const ITEM_TIER_RANK: Record<string, number> = {
  featured: 0,
  highlight: 1,
  basic: 2,
  none: 3,
};

function sortItemsByHighlight(rows: ItemWithCategory[]): ItemWithCategory[] {
  return rows.slice().sort((a, b) => {
    const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
    const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
    return ra - rb;
  });
}

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
  return sortItemsByHighlight((data ?? []) as ItemWithCategory[]);
}

export type ItemsSort = 'newest' | 'popular' | 'az';

// Ambil semua item published untuk sebuah kategori.
// Parameter `subcategory` (opsional) memfilter berdasar kolom subcategory.
// Parameter `sort` (opsional, default: 'az') mengatur urutan hasil.
export async function getItemsByCategory(
  categorySlug: string,
  subcategory?: string,
  sort: ItemsSort = 'az',
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

  query = query.order('is_verified', { ascending: false });
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'popular') {
    query = query.order('view_count', { ascending: false });
  } else {
    query = query.order('title', { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`[getItemsByCategory:${categorySlug}]`, error.message);
    return [];
  }
  return sortItemsByHighlight((data ?? []) as ItemWithCategory[]);
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

// Ambil featured & highlight items across all categories — dipakai homepage "Pilihan Unggulan".
export async function getFeaturedItemsForHomepage(
  limit = 6,
): Promise<ItemWithCategory[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('items')
    .select('*, category:categories!inner(name, slug, color, icon)')
    .eq('is_published', true)
    .in('highlight_tier', ['featured', 'highlight'])
    .or(`highlight_expires_at.is.null,highlight_expires_at.gt.${nowIso}`)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[getFeaturedItemsForHomepage]', error.message);
    return [];
  }
  return sortItemsByHighlight((data ?? []) as ItemWithCategory[]);
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

// =========================================================================
// ANNOUNCEMENTS — pengumuman & berita penting.
// =========================================================================

// List pengumuman aktif (published, belum expired).
// Urutan: pinned dulu, lalu published_at terbaru.
export async function getAnnouncements(
  limit?: number,
): Promise<Announcement[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.warn('[getAnnouncements]', error.message);
    return [];
  }
  return (data ?? []) as Announcement[];
}

// Pengumuman terbaru yang dipin — dipakai untuk banner di landing.
export async function getActiveBannerAnnouncement(): Promise<Announcement | null> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .eq('is_pinned', true)
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('[getActiveBannerAnnouncement]', error.message);
    return null;
  }
  return (data as Announcement | null) ?? null;
}

export async function getAnnouncementById(
  id: string,
): Promise<Announcement | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.warn(`[getAnnouncementById:${id}]`, error.message);
    return null;
  }
  return (data as Announcement | null) ?? null;
}

// =========================================================================
// ADS — iklan lokal.
// =========================================================================

// Ambil iklan aktif untuk placement tertentu.
// Kalau categorySlug diberikan, iklan yang category_slug-nya null (global)
// dan yang match akan keduanya di-consider; prioritas yang match duluan.
export async function getActiveAds(
  placement: AdPlacement,
  categorySlug?: string,
  limit = 3,
): Promise<Ad[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  let query = supabase
    .from('ads')
    .select('*')
    .eq('is_active', true)
    .eq('placement', placement)
    .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
    .or(`ends_at.is.null,ends_at.gt.${nowIso}`);

  if (categorySlug) {
    query = query.or(`category_slug.is.null,category_slug.eq.${categorySlug}`);
  } else {
    query = query.is('category_slug', null);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn(`[getActiveAds:${placement}]`, error.message);
    return [];
  }
  return (data ?? []) as Ad[];
}

// =========================================================================
// INFLUENCERS — direktori content creator lokal.
// =========================================================================

export type InfluencerFilters = {
  niche?: string;
  platform?: string;
  budget?: 'low' | 'mid' | 'high';
  sort?: 'popular' | 'followers' | 'cheapest';
};

// Hitung total followers dari kolom platforms jsonb (untuk sort).
function totalFollowers(inf: Influencer): number {
  return (inf.platforms ?? []).reduce((acc, p) => acc + (p.followers || 0), 0);
}

export async function getInfluencers(
  filters: InfluencerFilters = {},
): Promise<Influencer[]> {
  const supabase = createClient();
  let query = supabase
    .from('influencers')
    .select('*')
    .eq('is_published', true);

  if (filters.niche && filters.niche.trim() !== '') {
    query = query.contains('niches', [filters.niche]);
  }
  if (filters.budget === 'low') {
    query = query.lte('rate_max', 200000);
  } else if (filters.budget === 'mid') {
    query = query.gte('rate_min', 200000).lte('rate_max', 500000);
  } else if (filters.budget === 'high') {
    query = query.gte('rate_min', 500000);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[getInfluencers]', error.message);
    return [];
  }

  let rows = (data ?? []) as Influencer[];

  if (filters.platform && filters.platform.trim() !== '') {
    const p = filters.platform.toLowerCase();
    rows = rows.filter((r) =>
      (r.platforms ?? []).some((pl) => pl.platform === p),
    );
  }

  // Sort: highlighted tier di atas, lalu by pilihan user.
  const tierRank: Record<string, number> = {
    featured: 0,
    highlight: 1,
    basic: 2,
    none: 3,
  };

  rows.sort((a, b) => {
    const ta = tierRank[a.highlight_tier] ?? 3;
    const tb = tierRank[b.highlight_tier] ?? 3;
    if (ta !== tb) return ta - tb;

    if (filters.sort === 'followers') {
      return totalFollowers(b) - totalFollowers(a);
    }
    if (filters.sort === 'cheapest') {
      return (a.rate_min ?? Infinity) - (b.rate_min ?? Infinity);
    }
    // default / 'popular' — by view_count
    return (b.view_count ?? 0) - (a.view_count ?? 0);
  });

  return rows;
}

export async function getFeaturedInfluencers(
  limit = 2,
): Promise<Influencer[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('is_published', true)
    .in('highlight_tier', ['featured', 'highlight'])
    .or(`highlight_expires_at.is.null,highlight_expires_at.gt.${nowIso}`)
    .order('highlight_tier', { ascending: true })
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[getFeaturedInfluencers]', error.message);
    return [];
  }
  return (data ?? []) as Influencer[];
}

export async function getInfluencerBySlug(
  slug: string,
): Promise<Influencer | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('influencers')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.warn(`[getInfluencerBySlug:${slug}]`, error.message);
    return null;
  }
  return (data as Influencer | null) ?? null;
}

export async function getInfluencerSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('influencers')
    .select('slug')
    .eq('is_published', true);

  if (error || !data) return [];
  return (data as Array<{ slug: string }>).map((r) => r.slug);
}

// =========================================================================
// PRICING — konfigurasi paket harga untuk halaman /harga.
// =========================================================================

export async function getPricingTiers(): Promise<PricingConfig[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pricing_config')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.warn('[getPricingTiers]', error.message);
    return [];
  }
  return (data ?? []) as PricingConfig[];
}

// =========================================================================
// COMMUNITIES — direktori komunitas lokal.
// =========================================================================

export type CommunityFilters = {
  category?: CommunityCategory | string;
  isOpen?: boolean;
  sort?: 'popular' | 'members' | 'newest' | 'az';
};

function sortCommunitiesByTier(rows: Community[]): Community[] {
  return rows.slice().sort((a, b) => {
    const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
    const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
    return ra - rb;
  });
}

export async function getCommunities(
  filters: CommunityFilters = {},
): Promise<Community[]> {
  const supabase = createClient();
  let query = supabase
    .from('communities')
    .select('*')
    .eq('is_published', true);

  if (filters.category && filters.category.trim() !== '') {
    query = query.eq('category', filters.category);
  }
  if (filters.isOpen) {
    query = query.eq('is_open', true);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[getCommunities]', error.message);
    return [];
  }

  let rows = (data ?? []) as Community[];
  rows = sortCommunitiesByTier(rows);

  if (filters.sort === 'members') {
    rows.sort((a, b) => {
      const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
      const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
      if (ra !== rb) return ra - rb;
      return (b.member_count ?? 0) - (a.member_count ?? 0);
    });
  } else if (filters.sort === 'newest') {
    rows.sort((a, b) => {
      const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
      const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
      if (ra !== rb) return ra - rb;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  } else if (filters.sort === 'az') {
    rows.sort((a, b) => {
      const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
      const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name, 'id');
    });
  } else {
    rows.sort((a, b) => {
      const ra = ITEM_TIER_RANK[a.highlight_tier ?? 'none'] ?? 3;
      const rb = ITEM_TIER_RANK[b.highlight_tier ?? 'none'] ?? 3;
      if (ra !== rb) return ra - rb;
      return (b.view_count ?? 0) - (a.view_count ?? 0);
    });
  }

  return rows;
}

export async function getFeaturedCommunities(
  limit = 2,
): Promise<Community[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('is_published', true)
    .in('highlight_tier', ['featured', 'highlight'])
    .or(`highlight_expires_at.is.null,highlight_expires_at.gt.${nowIso}`)
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('[getFeaturedCommunities]', error.message);
    return [];
  }
  return sortCommunitiesByTier((data ?? []) as Community[]);
}

export async function getCommunityBySlug(
  slug: string,
): Promise<Community | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('communities')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.warn(`[getCommunityBySlug:${slug}]`, error.message);
    return null;
  }
  return (data as Community | null) ?? null;
}

export async function getCommunitySlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('communities')
    .select('slug')
    .eq('is_published', true);

  if (error || !data) return [];
  return (data as Array<{ slug: string }>).map((r) => r.slug);
}

// =========================================================================
// EVENTS — agenda kegiatan publik.
// =========================================================================

export type EventFilters = {
  category?: string;
  communityId?: string;
  timeframe?: 'upcoming' | 'past' | 'all';
  priceFilter?: 'free' | 'paid';
  sort?: 'soonest' | 'popular' | 'newest';
};

function normalizeEventRow(r: unknown): EventWithCommunity {
  const row = r as EventItem & {
    community:
      | { id: string; name: string; slug: string; logo_url: string | null }
      | Array<{
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
        }>
      | null;
  };
  const c = Array.isArray(row.community) ? row.community[0] : row.community;
  return {
    ...row,
    community: c ?? null,
  };
}

export async function getEvents(
  filters: EventFilters = {},
): Promise<EventWithCommunity[]> {
  const supabase = createClient();
  let query = supabase
    .from('events')
    .select('*, community:communities(id, name, slug, logo_url)')
    .eq('is_published', true);

  if (filters.category && filters.category.trim() !== '') {
    query = query.eq('category', filters.category);
  }
  if (filters.communityId) {
    query = query.eq('community_id', filters.communityId);
  }
  if (filters.priceFilter === 'free') {
    query = query.eq('ticket_price', 0);
  } else if (filters.priceFilter === 'paid') {
    query = query.gt('ticket_price', 0);
  }

  const nowIso = new Date().toISOString();
  if (filters.timeframe === 'past') {
    query = query.lt('start_date', nowIso).order('start_date', {
      ascending: false,
    });
  } else if (filters.timeframe === 'all') {
    if (filters.sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (filters.sort === 'popular') {
      query = query.order('view_count', { ascending: false });
    } else {
      query = query.order('start_date', { ascending: true });
    }
  } else {
    query = query.gte('start_date', nowIso).order('start_date', {
      ascending: true,
    });
  }

  const { data, error } = await query;
  if (error) {
    console.warn('[getEvents]', error.message);
    return [];
  }
  return (data ?? []).map(normalizeEventRow);
}

export async function getUpcomingEvents(
  limit = 3,
): Promise<EventWithCommunity[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*, community:communities(id, name, slug, logo_url)')
    .eq('is_published', true)
    .gte('start_date', nowIso)
    .order('is_featured', { ascending: false })
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.warn('[getUpcomingEvents]', error.message);
    return [];
  }
  return (data ?? []).map(normalizeEventRow);
}

export async function getFeaturedEvents(
  limit = 2,
): Promise<EventWithCommunity[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*, community:communities(id, name, slug, logo_url)')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('start_date', nowIso)
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.warn('[getFeaturedEvents]', error.message);
    return [];
  }
  return (data ?? []).map(normalizeEventRow);
}

export async function getEventBySlug(
  slug: string,
): Promise<EventWithCommunity | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, community:communities(id, name, slug, logo_url)')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error) {
    console.warn(`[getEventBySlug:${slug}]`, error.message);
    return null;
  }
  return data ? normalizeEventRow(data) : null;
}

export async function getEventSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('events')
    .select('slug')
    .eq('is_published', true);

  if (error || !data) return [];
  return (data as Array<{ slug: string }>).map((r) => r.slug);
}

export async function getEventsByCommunity(
  communityId: string,
  limit = 3,
): Promise<EventItem[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('community_id', communityId)
    .gte('start_date', nowIso)
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.warn(`[getEventsByCommunity:${communityId}]`, error.message);
    return [];
  }
  return (data ?? []) as EventItem[];
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
