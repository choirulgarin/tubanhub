// Parser & validator payload announcement — dipakai oleh POST/PATCH API.

const CATEGORIES = [
  'umum',
  'bencana',
  'kesehatan',
  'infrastruktur',
  'event',
] as const;
type Cat = (typeof CATEGORIES)[number];

export function parseAnnouncementPayload(
  body: unknown,
):
  | { error: string }
  | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) return { error: 'judul wajib diisi' };
  if (title.length > 200) return { error: 'judul maksimal 200 karakter' };

  const rawCat = typeof b.category === 'string' ? b.category : 'umum';
  if (!CATEGORIES.includes(rawCat as Cat)) {
    return { error: 'kategori tidak valid' };
  }

  const payload: Record<string, unknown> = {
    title,
    content: strOrNull(b.content),
    source: strOrNull(b.source, 120),
    source_url: strOrNull(b.source_url, 500),
    category: rawCat,
    is_pinned: !!b.is_pinned,
    is_published: !!b.is_published,
    published_at: dateOrNull(b.published_at),
    expires_at: dateOrNull(b.expires_at),
  };

  return { payload };
}

function strOrNull(v: unknown, max = 5000): string | null {
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
