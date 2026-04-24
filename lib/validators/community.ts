// Parser & validator payload community.

const CATEGORIES = [
  'olahraga',
  'seni-budaya',
  'bisnis-umkm',
  'sosial-lingkungan',
  'teknologi-kreatif',
  'pendidikan',
  'hobi',
  'keagamaan',
  'umum',
] as const;

const TIERS = ['none', 'basic', 'highlight', 'featured'] as const;

export function parseCommunityPayload(
  body: unknown,
): { error: string } | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { error: 'nama wajib diisi' };
  if (name.length > 160) return { error: 'nama maksimal 160 karakter' };

  const slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  if (!slug) return { error: 'slug wajib diisi' };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'slug hanya huruf kecil, angka, dan tanda -' };
  }

  const category = typeof b.category === 'string' ? b.category : 'umum';
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: 'kategori tidak valid' };
  }

  const tier = typeof b.highlight_tier === 'string' ? b.highlight_tier : 'none';
  if (!TIERS.includes(tier as (typeof TIERS)[number])) {
    return { error: 'highlight_tier tidak valid' };
  }

  const payload: Record<string, unknown> = {
    name,
    slug,
    tagline: strOrNull(b.tagline, 200),
    description: strOrNull(b.description, 3000),
    category,
    logo_url: strOrNull(b.logo_url, 500),
    cover_url: strOrNull(b.cover_url, 500),
    website: strOrNull(b.website, 300),
    contact_wa: strOrNull(b.contact_wa, 60),
    contact_email: strOrNull(b.contact_email, 200),
    instagram: strOrNull(b.instagram, 120),
    facebook: strOrNull(b.facebook, 200),
    tiktok: strOrNull(b.tiktok, 120),
    youtube: strOrNull(b.youtube, 200),
    whatsapp_group: strOrNull(b.whatsapp_group, 300),
    telegram_group: strOrNull(b.telegram_group, 300),
    area: strOrNull(b.area, 120),
    district: strOrNull(b.district, 120),
    meeting_place: strOrNull(b.meeting_place, 300),
    meeting_schedule: strOrNull(b.meeting_schedule, 200),
    member_count: intOrZero(b.member_count),
    founded_year: yearOrNull(b.founded_year),
    is_verified: !!b.is_verified,
    is_claimed: !!b.is_claimed,
    is_open: b.is_open === undefined ? true : !!b.is_open,
    tags: normalizeStringArray(b.tags, 20, 40),
    highlight_tier: tier,
    highlight_expires_at: dateOrNull(b.highlight_expires_at),
    is_published: b.is_published === undefined ? false : !!b.is_published,
  };

  return { payload };
}

function normalizeStringArray(v: unknown, maxLen = 20, itemMax = 40): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const raw of v) {
    if (typeof raw !== 'string') continue;
    const t = raw.trim().toLowerCase();
    if (!t) continue;
    out.push(t.length > itemMax ? t.slice(0, itemMax) : t);
    if (out.length >= maxLen) break;
  }
  return out;
}

function strOrNull(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}

function intOrZero(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }
  return 0;
}

function yearOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    const y = Math.floor(v);
    if (y >= 1800 && y <= 2100) return y;
    return null;
  }
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n >= 1800 && n <= 2100) return n;
  }
  return null;
}

function dateOrNull(v: unknown): string | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
