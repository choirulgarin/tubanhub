-- Tabel influencers — direktori content creator lokal Tuban.
-- Publik hanya membaca yang is_published=true.
-- Admin (admin_users) full CRUD. View count di-increment via RPC atomic.

CREATE TABLE IF NOT EXISTS public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  bio text,
  photo_url text,
  location text,
  district text,

  -- Platform & Stats — [{platform, username, followers, url}]
  platforms jsonb DEFAULT '[]'::jsonb,

  -- Niche kategori: kuliner, wisata, lifestyle, fashion, bisnis, religi, umkm, dll.
  niches text[] DEFAULT '{}',
  content_language text DEFAULT 'indonesia'
    CHECK (content_language IN ('indonesia','jawa','campur')),

  -- Rate card (dalam rupiah).
  rate_min integer,
  rate_max integer,
  rate_notes text,

  -- Kontak.
  contact_wa text,
  contact_email text,
  contact_dm text,

  -- Badges.
  is_verified boolean DEFAULT false,
  is_claimed boolean DEFAULT false,
  is_umkm_friendly boolean DEFAULT false,
  is_fast_response boolean DEFAULT false,

  -- Highlight tier untuk sistem featured ads.
  highlight_tier text DEFAULT 'none'
    CHECK (highlight_tier IN ('none','basic','highlight','featured')),
  highlight_expires_at timestamptz,

  view_count integer DEFAULT 0,
  is_published boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS influencers_slug_idx ON public.influencers(slug);
CREATE INDEX IF NOT EXISTS influencers_published_idx ON public.influencers(is_published);
CREATE INDEX IF NOT EXISTS influencers_highlight_idx
  ON public.influencers(highlight_tier, highlight_expires_at);

CREATE INDEX IF NOT EXISTS influencers_fts_idx ON public.influencers
USING gin(to_tsvector('indonesian',
  coalesce(name,'') || ' ' || coalesce(bio,'') || ' ' || coalesce(location,'')
));

DROP TRIGGER IF EXISTS trg_influencers_set_updated_at ON public.influencers;
CREATE TRIGGER trg_influencers_set_updated_at
  BEFORE UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- RPC: increment view count atomic.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.increment_influencer_view(inf_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.influencers SET view_count = view_count + 1 WHERE id = inf_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_influencer_view(uuid) TO anon, authenticated;

-- =========================================================================
-- RLS
-- =========================================================================
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published influencers" ON public.influencers;
CREATE POLICY "Public can read published influencers"
  ON public.influencers FOR SELECT TO public
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage influencers" ON public.influencers;
CREATE POLICY "Admins can manage influencers"
  ON public.influencers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- =========================================================================
-- CLAIM REQUESTS — pengajuan klaim listing.
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.claim_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_type text NOT NULL
    CHECK (listing_type IN ('influencer','wisata','kuliner','jasa','birokrasi')),
  listing_name text NOT NULL,
  owner_name text NOT NULL,
  proof_url text,
  contact_wa text,
  contact_email text,
  status text DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS claim_requests_status_idx
  ON public.claim_requests(status, created_at DESC);

ALTER TABLE public.claim_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit claim" ON public.claim_requests;
CREATE POLICY "Anyone can submit claim"
  ON public.claim_requests FOR INSERT TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view claims" ON public.claim_requests;
CREATE POLICY "Admins can view claims"
  ON public.claim_requests FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admins can update claims" ON public.claim_requests;
CREATE POLICY "Admins can update claims"
  ON public.claim_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- =========================================================================
-- SEED — 5 influencer dummy Tuban.
-- =========================================================================
INSERT INTO public.influencers
(name, slug, bio, location, district, platforms, niches,
 content_language, rate_min, rate_max, rate_notes,
 contact_wa, is_verified, is_umkm_friendly, is_fast_response,
 is_published, highlight_tier) VALUES

('Rina Tuban Vlog',
 'rina-tuban-vlog',
 'Content creator kuliner dan wisata lokal Tuban. Suka explore tempat makan hidden gem dan destinasi wisata yang belum banyak diketahui orang.',
 'Tuban Kota', 'Tuban',
 '[{"platform":"instagram","username":"@rinatubanvlog","followers":15000,"url":"https://instagram.com/rinatubanvlog"},{"platform":"tiktok","username":"@rinatuban","followers":32000,"url":"https://tiktok.com/@rinatuban"}]'::jsonb,
 ARRAY['kuliner','wisata','lifestyle'],
 'campur', 150000, 500000, 'Harga bisa nego untuk UMKM lokal Tuban',
 '08xxxxxxxxxx', true, true, true,
 true, 'none'),

('Bang Wisnu Official',
 'bang-wisnu-official',
 'Traveler dan food blogger asli Tuban. Sudah 5 tahun konsisten konten tentang keindahan Tuban dan sekitarnya.',
 'Tuban Kota', 'Tuban',
 '[{"platform":"instagram","username":"@bangwisnuofficial","followers":28000,"url":"https://instagram.com/bangwisnuofficial"},{"platform":"youtube","username":"Bang Wisnu","followers":8500,"url":"https://youtube.com"}]'::jsonb,
 ARRAY['wisata','kuliner','travel'],
 'indonesia', 300000, 1000000, 'Tersedia paket konten lengkap foto + video',
 '08xxxxxxxxxx', true, false, false,
 true, 'highlight'),

('Mbak Sari Lifestyle',
 'mbak-sari-lifestyle',
 'Lifestyle creator Tuban yang fokus di fashion lokal, UMKM, dan gaya hidup sehari-hari warga Tuban.',
 'Tuban Selatan', 'Tuban',
 '[{"platform":"instagram","username":"@mbaksarilifestyle","followers":9500,"url":"https://instagram.com/mbaksarilifestyle"},{"platform":"tiktok","username":"@mbaksari","followers":18000,"url":"https://tiktok.com/@mbaksari"}]'::jsonb,
 ARRAY['lifestyle','fashion','umkm'],
 'jawa', 100000, 300000, 'Ramah UMKM, tersedia review jujur',
 '08xxxxxxxxxx', true, true, true,
 true, 'none'),

('Tuban Food Hunter',
 'tuban-food-hunter',
 'Dedicated food reviewer Tuban. Sudah review 200+ tempat makan di Tuban dan sekitarnya. Rating jujur, foto aesthetic.',
 'Tuban Kota', 'Tuban',
 '[{"platform":"instagram","username":"@tubanfoodhunter","followers":22000,"url":"https://instagram.com/tubanfoodhunter"},{"platform":"tiktok","username":"@tubanfoodhunter","followers":45000,"url":"https://tiktok.com/@tubanfoodhunter"}]'::jsonb,
 ARRAY['kuliner','foodreview'],
 'indonesia', 200000, 750000, 'Spesialis food review, tersedia paket foto + video + caption',
 '08xxxxxxxxxx', true, true, false,
 true, 'featured'),

('Kang Dedi Adventure',
 'kang-dedi-adventure',
 'Adventure dan outdoor content creator. Explore alam Tuban yang belum banyak diketahui, dari pantai tersembunyi hingga hutan jati.',
 'Plumpang', 'Plumpang',
 '[{"platform":"instagram","username":"@kangdediadventure","followers":12000,"url":"https://instagram.com/kangdediadventure"},{"platform":"youtube","username":"Kang Dedi Adventure","followers":3200,"url":"https://youtube.com"}]'::jsonb,
 ARRAY['wisata','outdoor','adventure'],
 'indonesia', 200000, 600000, 'Tersedia paket one day trip content',
 '08xxxxxxxxxx', false, false, true,
 true, 'none');
