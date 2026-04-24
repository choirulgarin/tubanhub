-- Tabel suggestions — form "Usulkan Tempat" dari user publik.
-- Siapa pun boleh INSERT (anon), hanya admin yang bisa SELECT/UPDATE/DELETE.

CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  name text NOT NULL,
  address text,
  description text,
  contact text,
  submitted_by text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Index sederhana untuk dashboard admin (filter by status + urutan baru).
CREATE INDEX IF NOT EXISTS suggestions_status_created_at_idx
  ON public.suggestions (status, created_at DESC);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Siapa pun (termasuk anon) boleh submit usulan.
DROP POLICY IF EXISTS "Anyone can submit suggestions" ON public.suggestions;
CREATE POLICY "Anyone can submit suggestions"
  ON public.suggestions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Hanya admin yang terdaftar di admin_users yang bisa baca.
DROP POLICY IF EXISTS "Only admins can view suggestions" ON public.suggestions;
CREATE POLICY "Only admins can view suggestions"
  ON public.suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Hanya admin yang boleh update status/notes.
DROP POLICY IF EXISTS "Only admins can update suggestions" ON public.suggestions;
CREATE POLICY "Only admins can update suggestions"
  ON public.suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );

-- Hanya admin yang boleh delete.
DROP POLICY IF EXISTS "Only admins can delete suggestions" ON public.suggestions;
CREATE POLICY "Only admins can delete suggestions"
  ON public.suggestions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );
