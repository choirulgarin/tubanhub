// Validator untuk payload highlight yang dikirim dari admin.
// Shape: { listing_type, listing_id, tier, category_slug?, starts_at?, expires_at, payment_ref?, is_active? }

type ParsedOk = {
  payload: {
    listing_type: 'items' | 'influencer';
    listing_id: string;
    tier: 'basic' | 'highlight' | 'featured';
    category_slug: string | null;
    starts_at: string | null;
    expires_at: string;
    payment_ref: string | null;
    is_active: boolean;
  };
};

type ParsedError = { error: string };

const LISTING_TYPES = ['items', 'influencer'] as const;
const TIERS = ['basic', 'highlight', 'featured'] as const;

function strOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}

function dateOrNull(v: unknown): string | null {
  const s = strOrNull(v);
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function parseHighlightPayload(raw: unknown): ParsedOk | ParsedError {
  if (!raw || typeof raw !== 'object') return { error: 'invalid payload' };
  const r = raw as Record<string, unknown>;

  const listing_type = strOrNull(r.listing_type);
  if (!listing_type || !LISTING_TYPES.includes(listing_type as typeof LISTING_TYPES[number])) {
    return { error: 'listing_type tidak valid' };
  }

  const listing_id = strOrNull(r.listing_id);
  if (!listing_id) return { error: 'listing_id wajib diisi' };

  const tier = strOrNull(r.tier);
  if (!tier || !TIERS.includes(tier as typeof TIERS[number])) {
    return { error: 'tier tidak valid' };
  }

  const expires_at = dateOrNull(r.expires_at);
  if (!expires_at) return { error: 'expires_at wajib diisi' };

  return {
    payload: {
      listing_type: listing_type as 'items' | 'influencer',
      listing_id,
      tier: tier as 'basic' | 'highlight' | 'featured',
      category_slug: strOrNull(r.category_slug),
      starts_at: dateOrNull(r.starts_at),
      expires_at,
      payment_ref: strOrNull(r.payment_ref),
      is_active: r.is_active === false ? false : true,
    },
  };
}
