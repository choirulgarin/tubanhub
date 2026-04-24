// Parser & validator payload ad.

const PLACEMENTS = [
  'home_top',
  'home_bottom',
  'category_top',
  'sidebar',
] as const;
type Placement = (typeof PLACEMENTS)[number];

export function parseAdPayload(
  body: unknown,
):
  | { error: string }
  | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) return { error: 'judul iklan wajib diisi' };
  if (title.length > 120) return { error: 'judul maksimal 120 karakter' };

  const placement = typeof b.placement === 'string' ? b.placement : 'home_bottom';
  if (!PLACEMENTS.includes(placement as Placement)) {
    return { error: 'placement tidak valid' };
  }

  const payload: Record<string, unknown> = {
    title,
    description: strOrNull(b.description, 400),
    image_url: strOrNull(b.image_url, 500),
    link_url: strOrNull(b.link_url, 500),
    advertiser_name: strOrNull(b.advertiser_name, 120),
    advertiser_contact: strOrNull(b.advertiser_contact, 120),
    placement,
    category_slug: strOrNull(b.category_slug, 60),
    starts_at: dateOrNull(b.starts_at),
    ends_at: dateOrNull(b.ends_at),
    is_active: b.is_active === undefined ? true : !!b.is_active,
  };

  return { payload };
}

function strOrNull(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function dateOrNull(v: unknown): string | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
