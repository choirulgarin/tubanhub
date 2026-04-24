// Parser & validator payload claim request.

const TYPES = ['influencer', 'wisata', 'kuliner', 'jasa', 'birokrasi'] as const;

export function parseClaimPayload(
  body: unknown,
):
  | { error: string }
  | { payload: Record<string, unknown> } {
  if (!body || typeof body !== 'object') return { error: 'payload invalid' };
  const b = body as Record<string, unknown>;

  const type = typeof b.listing_type === 'string' ? b.listing_type : '';
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return { error: 'jenis listing tidak valid' };
  }

  const listingName = typeof b.listing_name === 'string' ? b.listing_name.trim() : '';
  if (!listingName) return { error: 'nama listing wajib diisi' };
  if (listingName.length > 200) return { error: 'nama listing maksimal 200 karakter' };

  const ownerName = typeof b.owner_name === 'string' ? b.owner_name.trim() : '';
  if (!ownerName) return { error: 'nama pemilik wajib diisi' };
  if (ownerName.length > 120) return { error: 'nama pemilik maksimal 120 karakter' };

  const wa = strOrNull(b.contact_wa, 60);
  const email = strOrNull(b.contact_email, 200);
  if (!wa && !email) {
    return { error: 'kontak WA atau email wajib diisi' };
  }

  return {
    payload: {
      listing_type: type,
      listing_name: listingName,
      owner_name: ownerName,
      proof_url: strOrNull(b.proof_url, 500),
      contact_wa: wa,
      contact_email: email,
    },
  };
}

function strOrNull(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max) : t;
}
