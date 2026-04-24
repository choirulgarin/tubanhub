-- Tabel ads — slot iklan lokal untuk UMKM/tempat di Tuban.
-- Admin membuat & mengelola; publik cuma konsumsi (render + track view/click).
-- Counter view & click di-update via RPC atomic agar aman dari race condition.

CREATE TABLE IF NOT EXISTS public.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  advertiser_name text,
  advertiser_contact text,
  placement text NOT NULL DEFAULT 'home_bottom'
    CHECK (placement IN (
      'home_top',
      'home_bottom',
      'category_top',
      'sidebar'
    )),
  -- target kategori (slug). NULL = muncul di semua kategori untuk placement yang relevan.
  category_slug text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  impressions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index dipakai pemilihan iklan aktif per placement (+ kategori opsional).
CREATE INDEX IF NOT EXISTS ads_placement_active_idx
  ON public.ads (placement, is_active, starts_at, ends_at);

CREATE INDEX IF NOT EXISTS ads_category_slug_idx
  ON public.ads (category_slug);

-- Auto-update updated_at.
DROP TRIGGER IF EXISTS trg_ads_set_updated_at ON public.ads;
CREATE TRIGGER trg_ads_set_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- RPC: increment counter impressions/clicks secara atomic.
-- Dipanggil oleh client publik tanpa auth (UPDATE di-gate via RLS policy
-- khusus yang melewati SECURITY DEFINER function ini).
-- =========================================================================

CREATE OR REPLACE FUNCTION public.increment_ad_metric(
  ad_id uuid,
  metric text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF metric = 'impression' THEN
    UPDATE public.ads SET impressions = impressions + 1 WHERE id = ad_id;
  ELSIF metric = 'click' THEN
    UPDATE public.ads SET clicks = clicks + 1 WHERE id = ad_id;
  ELSE
    RAISE EXCEPTION 'invalid metric: %', metric;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_ad_metric(uuid, text) TO anon, authenticated;

-- =========================================================================
-- RLS
-- =========================================================================

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Publik: hanya baca iklan aktif & dalam rentang waktu valid.
DROP POLICY IF EXISTS "Public can view active ads" ON public.ads;
CREATE POLICY "Public can view active ads"
  ON public.ads
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Admin: full access.
DROP POLICY IF EXISTS "Admins can view all ads" ON public.ads;
CREATE POLICY "Admins can view all ads"
  ON public.ads
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert ads" ON public.ads;
CREATE POLICY "Admins can insert ads"
  ON public.ads
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update ads" ON public.ads;
CREATE POLICY "Admins can update ads"
  ON public.ads
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can delete ads" ON public.ads;
CREATE POLICY "Admins can delete ads"
  ON public.ads
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
