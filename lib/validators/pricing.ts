// Validator untuk PATCH payload ke /api/pricing/[id].
// Semua field opsional — hanya yang dikirim yang di-update.

type ParsedOk = { payload: Record<string, unknown> };
type ParsedError = { error: string };

function strOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t === '' ? null : t;
}
function intOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.round(n));
}

export function parsePricingPayload(raw: unknown): ParsedOk | ParsedError {
  if (!raw || typeof raw !== 'object') return { error: 'invalid payload' };
  const r = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  if (r.tier_label !== undefined) {
    const s = strOrNull(r.tier_label);
    if (!s) return { error: 'tier_label wajib diisi' };
    out.tier_label = s;
  }
  if (r.tagline !== undefined) out.tagline = strOrNull(r.tagline);
  if (r.price_note !== undefined) out.price_note = strOrNull(r.price_note);
  if (r.cta_label !== undefined) out.cta_label = strOrNull(r.cta_label);
  if (r.cta_href !== undefined) out.cta_href = strOrNull(r.cta_href);

  if (r.price_monthly !== undefined) {
    const n = intOrNull(r.price_monthly);
    if (n === null) return { error: 'price_monthly tidak valid' };
    out.price_monthly = n;
  }
  if (r.price_yearly !== undefined) {
    const n = intOrNull(r.price_yearly);
    if (n === null) return { error: 'price_yearly tidak valid' };
    out.price_yearly = n;
  }
  if (r.order_index !== undefined) {
    const n = intOrNull(r.order_index);
    if (n === null) return { error: 'order_index tidak valid' };
    out.order_index = n;
  }

  if (Array.isArray(r.features)) {
    out.features = (r.features as unknown[])
      .map((f) => (typeof f === 'string' ? f.trim() : ''))
      .filter((s) => s.length > 0);
  }

  if (typeof r.is_featured === 'boolean') out.is_featured = r.is_featured;
  if (typeof r.is_active === 'boolean') out.is_active = r.is_active;

  if (Object.keys(out).length === 0) {
    return { error: 'no fields to update' };
  }
  out.updated_at = new Date().toISOString();
  return { payload: out };
}
