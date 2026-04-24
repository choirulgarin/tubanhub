// Parser & validator payload event.

const CATEGORIES = [
  'umum',
  'olahraga',
  'bisnis',
  'sosial',
  'seni-budaya',
  'keagamaan',
  'pendidikan',
  'teknologi',
] as const;

export function parseEventPayload(
  body: unknown,
): { error: string } | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) return { error: 'judul wajib diisi' };
  if (title.length > 200) return { error: 'judul maksimal 200 karakter' };

  const slug = typeof b.slug === 'string' ? b.slug.trim() : '';
  if (!slug) return { error: 'slug wajib diisi' };
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: 'slug hanya huruf kecil, angka, dan tanda -' };
  }

  const category = typeof b.category === 'string' ? b.category : 'umum';
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: 'kategori tidak valid' };
  }

  const startDate = dateOrNull(b.start_date);
  if (!startDate) return { error: 'tanggal mulai wajib diisi' };

  const endDate = dateOrNull(b.end_date);

  const communityIdRaw = b.community_id;
  const communityId =
    typeof communityIdRaw === 'string' && communityIdRaw.trim() !== ''
      ? communityIdRaw.trim()
      : null;

  const payload: Record<string, unknown> = {
    title,
    slug,
    tagline: strOrNull(b.tagline, 200),
    description: strOrNull(b.description, 1000),
    content: strOrNull(b.content, 10000),
    category,
    cover_url: strOrNull(b.cover_url, 500),
    community_id: communityId,
    organizer_name: strOrNull(b.organizer_name, 160),
    organizer_contact: strOrNull(b.organizer_contact, 200),
    start_date: startDate,
    end_date: endDate,
    location_name: strOrNull(b.location_name, 160),
    location_address: strOrNull(b.location_address, 400),
    district: strOrNull(b.district, 120),
    gmaps_url: strOrNull(b.gmaps_url, 500),
    is_online: !!b.is_online,
    online_url: strOrNull(b.online_url, 500),
    ticket_price: intOrZero(b.ticket_price),
    ticket_note: strOrNull(b.ticket_note, 200),
    registration_url: strOrNull(b.registration_url, 500),
    registration_deadline: dateOrNull(b.registration_deadline),
    max_attendees: intOrNull(b.max_attendees),
    current_attendees: intOrZero(b.current_attendees),
    tags: normalizeStringArray(b.tags, 20, 40),
    is_featured: !!b.is_featured,
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

function intOrNull(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return Math.max(0, Math.floor(v));
  }
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
