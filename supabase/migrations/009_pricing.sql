-- Tabel pricing_config — konfigurasi paket harga yang dieditabel dari admin.

CREATE TABLE IF NOT EXISTS public.pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_key text UNIQUE NOT NULL,
  tier_label text NOT NULL,
  tagline text,
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  price_note text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text DEFAULT 'Pilih paket',
  cta_href text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pricing_config_active_idx
  ON public.pricing_config(is_active, order_index);

ALTER TABLE public.pricing_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active pricing" ON public.pricing_config;
CREATE POLICY "Public can read active pricing"
  ON public.pricing_config FOR SELECT TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage pricing" ON public.pricing_config;
CREATE POLICY "Admins can manage pricing"
  ON public.pricing_config FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Seed default 5 tier.
INSERT INTO public.pricing_config
  (tier_key, tier_label, tagline, price_monthly, price_yearly, price_note,
   features, cta_label, cta_href, is_featured, order_index)
VALUES
  ('free', 'Gratis', 'Untuk semua UMKM Tuban', 0, 0, 'Selamanya gratis',
   '["Listing di direktori", "Profil dasar (nama, lokasi, kontak)", "Badge Terverifikasi (opsional)", "Akses form Usul & Klaim"]'::jsonb,
   'Mulai sekarang', '/usul', false, 1),
  ('basic', 'Basic Highlight', 'Tampil lebih menonjol di daftar', 50000, 500000, 'Per listing, per bulan',
   '["Semua fitur Gratis", "Badge Basic Highlight", "Prioritas ringan di grid", "Analytics view dasar"]'::jsonb,
   'Hubungi Admin', 'https://wa.me/62', false, 2),
  ('highlight', 'Unggulan', 'Border biru + posisi atas grid', 150000, 1500000, 'Per listing, per bulan',
   '["Semua fitur Basic", "Border biru + badge Unggulan", "Posisi di atas listing reguler", "Tampil di section Pilihan Unggulan homepage", "Analytics view & click"]'::jsonb,
   'Hubungi Admin', 'https://wa.me/62', true, 3),
  ('featured', 'Featured', 'Paket premium — paling menonjol', 300000, 3000000, 'Per listing, per bulan',
   '["Semua fitur Unggulan", "Border amber + Pin icon", "Posisi paling atas (featured slot)", "Prioritas di search results", "Banner di homepage Pilihan Unggulan", "Support prioritas"]'::jsonb,
   'Hubungi Admin', 'https://wa.me/62', false, 4),
  ('klaim', 'Klaim Profil', 'Ambil alih listing yang sudah ada', 50000, 50000, 'Sekali bayar',
   '["Verifikasi kepemilikan listing", "Edit info sendiri via dashboard", "Badge Terverifikasi", "Balas klaim dalam 1–3 hari kerja"]'::jsonb,
   'Ajukan Klaim', '/klaim', false, 5)
ON CONFLICT (tier_key) DO NOTHING;
