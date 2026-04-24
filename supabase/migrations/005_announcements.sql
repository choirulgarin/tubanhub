-- Tabel announcements — pengumuman & berita penting untuk warga Tuban.
-- Contoh: info bencana, pengumuman kesehatan, perbaikan infrastruktur, event daerah.
--
-- Public hanya bisa baca yang sudah published dan belum expired.
-- Admin (admin_users) full CRUD.

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  source text,
  source_url text,
  category text DEFAULT 'umum'
    CHECK (category IN ('umum', 'bencana', 'kesehatan', 'infrastruktur', 'event')),
  is_pinned boolean DEFAULT false,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index untuk list publik (pinned dulu, lalu terbaru).
CREATE INDEX IF NOT EXISTS announcements_published_idx
  ON public.announcements (is_published, is_pinned DESC, published_at DESC);

CREATE INDEX IF NOT EXISTS announcements_category_idx
  ON public.announcements (category);

-- Auto-update updated_at.
DROP TRIGGER IF EXISTS trg_announcements_set_updated_at ON public.announcements;
CREATE TRIGGER trg_announcements_set_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Publik: hanya baca yang published dan belum expired.
DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
CREATE POLICY "Public can view active announcements"
  ON public.announcements
  FOR SELECT
  TO public
  USING (
    is_published = true
    AND (expires_at IS NULL OR expires_at > now())
  );

-- Admin: full access.
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
CREATE POLICY "Admins can view all announcements"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
CREATE POLICY "Admins can insert announcements"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
CREATE POLICY "Admins can update announcements"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;
CREATE POLICY "Admins can delete announcements"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );
