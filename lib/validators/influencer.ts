// Parser & validator payload influencer.

const LANGS = ['indonesia', 'jawa', 'campur'] as const;
const TIERS = ['none', 'basic', 'highlight', 'featured'] as const;
const VALID_PLATFORMS = [
  'instagram',
  'tiktok',
  'youtube',
  'facebook',
  'twitter',
] as const;

export function parseInfluencerPayload(
  body: unknown,
):
  | { error: string }
  | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) return { error: 'nama wajib diisi' };
  if (name.length > 120) return { error: 'nama maksimal 120 karakter' };

  const slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  if (!slug) return { error: 'slug wajib diisi' };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'slug hanya huruf kecil, angka, dan tanda -' };

  const lang = typeof b.content_language === 'string' ? b.content_language : 'indonesia';
  if (!LANGS.includes(lang as (typeof LANGS)[number])) {
    return { error: 'bahasa konten tidak valid' };
  }

  const tier = typeof b.highlight_tier === 'string' ? b.highlight_tier : 'none';
  if (!TIERS.includes(tier as (typeof TIERS)[number])) {
    return { error: 'highlight_tier tidak valid' };
  }

  const platforms = normalizePlatforms(b.platforms);
  const niches = normalizeStringArray(b.niches, 20, 40);

  const payload: Record<string, unknown> = {
    name,
    slug,
    bio: strOrNull(b.bio, 1500),
    photo_url: strOrNull(b.photo_url, 500),
    location: strOrNull(b.location, 120),
    district: strOrNull(b.district, 120),
    platforms,
    niches,
    content_language: lang,
    rate_min: intOrNull(b.rate_min),
    rate_max: intOrNull(b.rate_max),
    rate_notes: strOrNull(b.rate_notes, 400),
    contact_wa: strOrNull(b.contact_wa, 60),
    contact_email: strOrNull(b.contact_email, 200),
    contact_dm: strOrNull(b.contact_dm, 60),
    is_verified: !!b.is_verified,
    is_claimed: !!b.is_claimed,
    is_umkm_friendly: !!b.is_umkm_friendly,
    is_fast_response: !!b.is_fast_response,
    highlight_tier: tier,
    highlight_expires_at: dateOrNull(b.highlight_expires_at),
    is_published: b.is_published === undefined ? false : !!b.is_published,
  };

  return { payload };
}

function normalizePlatforms(v: unknown): Array<{
  platform: string;
  username: string;
  followers: number;
  url: string;
}> {
  if (!Array.isArray(v)) return [];
  return v
    .map((raw) => {
      if (!raw || typeof raw !== 'object') return null;
      const r = raw as Record<string, unknown>;
      const platform = typeof r.platform === 'string' ? r.platform.trim().toLowerCase() : '';
      if (!VALID_PLATFORMS.includes(platform as (typeof VALID_PLATFORMS)[number])) return null;
      const username = typeof r.username === 'string' ? r.username.trim().slice(0, 80) : '';
      const url = typeof r.url === 'string' ? r.url.trim().slice(0, 500) : '';
      const followersRaw = r.followers;
      const followers =
        typeof followersRaw === 'number'
          ? Math.max(0, Math.floor(followersRaw))
          : typeof followersRaw === 'string' && followersRaw.trim() !== ''
            ? Math.max(0, parseInt(followersRaw, 10) || 0)
            : 0;
      if (!username && !url) return null;
      return { platform, username, followers, url };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);
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

function intOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.max(0, n) : null;
  }
  return null;
}

function dateOrNull(v: unknown): string | null {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}
