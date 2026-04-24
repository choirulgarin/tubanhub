import { generateSlug } from '@/lib/utils/slug';

// Parser & validator payload item — dipakai oleh POST /api/items dan PUT /api/items/[id].
// Mengembalikan { error } atau { payload } yang aman untuk langsung di-insert/update.
export function parseItemPayload(
  body: unknown,
):
  | { error: string }
  | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  const category_id = typeof b.category_id === 'string' ? b.category_id : '';
  if (!title) return { error: 'title wajib diisi' };
  if (!category_id) return { error: 'category_id wajib diisi' };

  let slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  if (!slug) slug = generateSlug(title);
  if (!/^[a-z0-9-]+$/.test(slug))
    return { error: 'slug hanya boleh huruf kecil, angka, dan tanda strip' };

  const payload: Record<string, unknown> = {
    category_id,
    title,
    slug,
    subcategory: strOrNull(b.subcategory),
    description: strOrNull(b.description),
    content: strOrNull(b.content),
    tags: arrOfString(b.tags),
    phone: strOrNull(b.phone),
    whatsapp: strOrNull(b.whatsapp),
    email: strOrNull(b.email),
    website: strOrNull(b.website),
    address: strOrNull(b.address),
    district: strOrNull(b.district),
    gmaps_url: strOrNull(b.gmaps_url),
    lat: numOrNull(b.lat),
    lng: numOrNull(b.lng),
    opening_hours: isObj(b.opening_hours) ? b.opening_hours : {},
    thumbnail_url: strOrNull(b.thumbnail_url),
    images: arrOfString(b.images),
    metadata: isObj(b.metadata) ? b.metadata : {},
    is_published: !!b.is_published,
    is_verified: !!b.is_verified,
  };

  return { payload };
}

function strOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}
function numOrNull(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return isNaN(n) ? null : n;
}
function arrOfString(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}
