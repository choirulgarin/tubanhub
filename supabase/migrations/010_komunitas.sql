-- =========================================================================
-- Direktori Komunitas & Event Tuban
-- =========================================================================

-- =========================================================================
-- 1. TABLE communities
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text,
  category text NOT NULL DEFAULT 'umum',
  logo_url text,
  cover_url text,
  website text,
  contact_wa text,
  contact_email text,
  instagram text,
  facebook text,
  tiktok text,
  youtube text,
  whatsapp_group text,
  telegram_group text,
  area text,
  district text,
  meeting_place text,
  meeting_schedule text,
  member_count integer DEFAULT 0,
  founded_year integer,
  is_verified boolean DEFAULT false,
  is_claimed boolean DEFAULT false,
  is_open boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  highlight_tier text NOT NULL DEFAULT 'none'
    CHECK (highlight_tier IN ('none', 'basic', 'highlight', 'featured')),
  highlight_expires_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS communities_category_idx ON public.communities(category);
CREATE INDEX IF NOT EXISTS communities_published_idx ON public.communities(is_published);
CREATE INDEX IF NOT EXISTS communities_district_idx ON public.communities(district);
CREATE INDEX IF NOT EXISTS communities_tags_idx ON public.communities USING gin(tags);
CREATE INDEX IF NOT EXISTS communities_search_idx
  ON public.communities USING gin (
    to_tsvector('simple',
      coalesce(name, '') || ' ' ||
      coalesce(tagline, '') || ' ' ||
      coalesce(description, '')
    )
  );

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published communities" ON public.communities;
CREATE POLICY "Public can read published communities"
  ON public.communities FOR SELECT TO public
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage communities" ON public.communities;
CREATE POLICY "Admins can manage communities"
  ON public.communities FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP TRIGGER IF EXISTS trg_communities_set_updated_at ON public.communities;
CREATE TRIGGER trg_communities_set_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_community_view(comm_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.communities SET view_count = view_count + 1 WHERE id = comm_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_community_view(uuid) TO anon, authenticated;

-- =========================================================================
-- 2. TABLE events
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  tagline text,
  description text,
  content text,
  category text NOT NULL DEFAULT 'umum',
  cover_url text,
  community_id uuid REFERENCES public.communities(id) ON DELETE SET NULL,
  organizer_name text,
  organizer_contact text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location_name text,
  location_address text,
  district text,
  gmaps_url text,
  is_online boolean DEFAULT false,
  online_url text,
  ticket_price integer DEFAULT 0,
  ticket_note text,
  registration_url text,
  registration_deadline timestamptz,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS events_published_idx ON public.events(is_published);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON public.events(start_date);
CREATE INDEX IF NOT EXISTS events_community_idx ON public.events(community_id);
CREATE INDEX IF NOT EXISTS events_tags_idx ON public.events USING gin(tags);
CREATE INDEX IF NOT EXISTS events_search_idx
  ON public.events USING gin (
    to_tsvector('simple',
      coalesce(title, '') || ' ' ||
      coalesce(tagline, '') || ' ' ||
      coalesce(description, '')
    )
  );

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published events" ON public.events;
CREATE POLICY "Public can read published events"
  ON public.events FOR SELECT TO public
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

DROP TRIGGER IF EXISTS trg_events_set_updated_at ON public.events;
CREATE TRIGGER trg_events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.increment_event_view(evt_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.events SET view_count = view_count + 1 WHERE id = evt_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_event_view(uuid) TO anon, authenticated;

-- =========================================================================
-- 3. SEED data
-- =========================================================================
INSERT INTO public.communities
  (name, slug, tagline, description, category, area, district,
   meeting_place, meeting_schedule, member_count, founded_year,
   is_verified, is_open, tags, is_published)
VALUES
  ('Komunitas Sepeda Tuban', 'komunitas-sepeda-tuban',
   'Gowes bareng setiap Minggu pagi',
   'Komunitas pesepeda yang aktif keliling Tuban dan sekitarnya. Terbuka untuk semua level.',
   'olahraga', 'Tuban Kota', 'Tuban',
   'Alun-alun Tuban', 'Minggu pagi 05.30',
   120, 2018, true, true,
   ARRAY['sepeda', 'gowes', 'olahraga'], true),
  ('Sanggar Seni Ronggolawe', 'sanggar-seni-ronggolawe',
   'Melestarikan seni tari dan musik tradisional Tuban',
   'Sanggar yang fokus pada tari ronggolawe, gamelan, dan kesenian daerah Tuban lainnya.',
   'seni-budaya', 'Tuban Kota', 'Tuban',
   'Jl. Ronggolawe No. 15', 'Sabtu sore 16.00',
   45, 2010, true, true,
   ARRAY['tari', 'gamelan', 'tradisi'], true),
  ('UMKM Tuban Bangkit', 'umkm-tuban-bangkit',
   'Wadah pelaku UMKM kabupaten Tuban',
   'Komunitas pelaku usaha mikro untuk saling support, bertukar ilmu, dan kolaborasi pemasaran.',
   'bisnis-umkm', 'Se-Kabupaten Tuban', null,
   'Rotating (online + offline)', 'Rapat bulanan',
   230, 2020, true, true,
   ARRAY['umkm', 'bisnis', 'networking'], true),
  ('Peduli Lingkungan Tuban', 'peduli-lingkungan-tuban',
   'Aksi bersih pantai & edukasi sampah',
   'Komunitas relawan yang rutin melakukan aksi bersih pantai dan sosialisasi pengelolaan sampah.',
   'sosial-lingkungan', 'Tuban Utara', 'Tuban',
   'Pantai Boom / variatif', 'Minggu kedua tiap bulan',
   80, 2019, false, true,
   ARRAY['lingkungan', 'relawan', 'bersih-pantai'], true),
  ('Devcode Tuban', 'devcode-tuban',
   'Komunitas developer & kreatif digital',
   'Meetup developer Tuban — web, mobile, data. Sharing, ngoding bareng, dan kolaborasi project.',
   'teknologi-kreatif', 'Tuban Kota', 'Tuban',
   'Cafe Semesta / online', 'Meetup tiap 2 minggu',
   60, 2022, true, true,
   ARRAY['developer', 'teknologi', 'meetup'], true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.events
  (title, slug, tagline, description, category,
   organizer_name, start_date, end_date,
   location_name, location_address, district,
   ticket_price, is_published)
VALUES
  ('Tuban Fun Bike 2026', 'tuban-fun-bike-2026',
   'Gowes santai keliling kota Tuban',
   'Event gowes massal — semua boleh ikut. Start dari Alun-alun, finish di Pantai Boom.',
   'olahraga',
   'Komunitas Sepeda Tuban',
   (now() + interval '14 days')::timestamptz,
   (now() + interval '14 days 4 hours')::timestamptz,
   'Alun-alun Tuban', 'Jl. Pemuda, Tuban', 'Tuban',
   0, true),
  ('Festival Ronggolawe', 'festival-ronggolawe',
   'Pagelaran tari & musik khas Tuban',
   'Festival tahunan menampilkan tari ronggolawe, gamelan, dan pertunjukan seni daerah.',
   'seni-budaya',
   'Sanggar Seni Ronggolawe',
   (now() + interval '30 days')::timestamptz,
   (now() + interval '32 days')::timestamptz,
   'GOR Rangga Jaya', 'Jl. Sunan Bonang, Tuban', 'Tuban',
   25000, true),
  ('Meetup UMKM Tuban — Digital Marketing', 'meetup-umkm-digital-marketing',
   'Workshop & sharing pelaku usaha',
   'Sesi sharing tentang strategi pemasaran digital untuk UMKM lokal Tuban.',
   'bisnis',
   'UMKM Tuban Bangkit',
   (now() + interval '7 days')::timestamptz,
   (now() + interval '7 days 3 hours')::timestamptz,
   'Cafe Semesta', 'Jl. Basuki Rahmat, Tuban', 'Tuban',
   0, true)
ON CONFLICT (slug) DO NOTHING;
