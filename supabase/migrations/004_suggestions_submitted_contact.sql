-- Tambah kolom `submitted_contact` ke tabel suggestions —
-- nomor WA / kontak pengusul (berbeda dari `contact` yang merupakan kontak tempat).
-- Idempotent: aman dijalankan berulang.

ALTER TABLE public.suggestions
  ADD COLUMN IF NOT EXISTS submitted_contact text;
