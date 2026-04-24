-- Tambah kolom highlight ke tabel items existing.
ALTER TABLE public.items
  ADD COLUMN IF NOT EXISTS highlight_tier text DEFAULT 'none'
    CHECK (highlight_tier IN ('none','basic','highlight','featured')),
  ADD COLUMN IF NOT EXISTS highlight_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS items_highlight_idx
  ON public.items(highlight_tier, highlight_expires_at);

-- Tabel highlights — tracking semua active paid highlights.
CREATE TABLE IF NOT EXISTS public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type text NOT NULL
    CHECK (listing_type IN ('items','influencer')),
  listing_id uuid NOT NULL,
  tier text NOT NULL
    CHECK (tier IN ('basic','highlight','featured')),
  category_slug text,
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  payment_ref text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS highlights_active_idx
  ON public.highlights(is_active, expires_at, listing_type);
CREATE INDEX IF NOT EXISTS highlights_listing_idx
  ON public.highlights(listing_type, listing_id);

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active highlights" ON public.highlights;
CREATE POLICY "Public can read active highlights"
  ON public.highlights FOR SELECT TO public
  USING (is_active = true AND expires_at > now());

DROP POLICY IF EXISTS "Admins can manage highlights" ON public.highlights;
CREATE POLICY "Admins can manage highlights"
  ON public.highlights FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
