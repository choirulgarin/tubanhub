-- Tabel contacts — menyimpan pesan dari form "Hubungi Kami".
-- Siapa pun boleh INSERT (anon), hanya admin yang bisa SELECT.

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contacts_created_at_idx
  ON public.contacts (created_at DESC);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contacts;
CREATE POLICY "Anyone can submit contact"
  ON public.contacts
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view contacts" ON public.contacts;
CREATE POLICY "Only admins can view contacts"
  ON public.contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    )
  );
