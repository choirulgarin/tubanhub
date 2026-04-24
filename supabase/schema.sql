-- ============================================================================
-- TubanHub — Database Schema
-- ============================================================================
-- File ini berisi seluruh skema database untuk TubanHub:
--   1. Extensions
--   2. Tabel: categories, items, admin_users
--   3. Indexes (termasuk full-text search)
--   4. Trigger auto-update updated_at
--   5. Function search_items(search_query)
--   6. Row Level Security (RLS) + Policies
--   7. Seed data: 4 kategori, 3 item birokrasi, 3 item wisata
--
-- Cara pakai: jalankan seluruh file ini di Supabase SQL Editor (urutan penting).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
-- pgcrypto: untuk gen_random_uuid()
create extension if not exists pgcrypto;


-- ----------------------------------------------------------------------------
-- 2. TABEL
-- ----------------------------------------------------------------------------

-- Tabel categories: kategori utama (birokrasi, wisata, kuliner, jasa, dll)
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  icon         text,              -- nama icon dari lucide-react (contoh: "map-pin")
  color        text,              -- warna hex (contoh: "#2563EB")
  order_index  integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Tabel items: entri utama (layanan birokrasi, tempat wisata, kuliner, jasa)
create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid not null references public.categories(id) on delete cascade,
  subcategory    text,
  title          text not null,
  slug           text not null unique,
  description    text,
  content        text,              -- panduan lengkap / deskripsi panjang
  tags           text[] not null default '{}',
  phone          text,
  whatsapp       text,
  email          text,
  website        text,
  address        text,
  district       text,              -- kecamatan
  gmaps_url      text,
  lat            decimal(10, 7),
  lng            decimal(10, 7),
  opening_hours  jsonb not null default '{}'::jsonb,
  images         text[] not null default '{}',
  thumbnail_url  text,
  metadata       jsonb not null default '{}'::jsonb,
  is_published   boolean not null default false,
  is_verified    boolean not null default false,
  view_count     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Tabel admin_users: daftar user yang boleh masuk admin panel
create table if not exists public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 3. INDEXES
-- ----------------------------------------------------------------------------

-- Index untuk lookup cepat
create index if not exists idx_items_slug          on public.items (slug);
create index if not exists idx_items_category_id   on public.items (category_id);
create index if not exists idx_items_is_published  on public.items (is_published);
create index if not exists idx_items_category_pub  on public.items (category_id, is_published);

-- Full-text search index (GIN) — gabungan title + description + content
create index if not exists idx_items_fts
  on public.items
  using gin (
    to_tsvector(
      'simple',
      coalesce(title, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(address, '')
    )
  );

-- Index untuk pencarian berbasis tags
create index if not exists idx_items_tags on public.items using gin (tags);


-- ----------------------------------------------------------------------------
-- 4. TRIGGER: auto-update kolom updated_at
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_items_set_updated_at on public.items;
create trigger trg_items_set_updated_at
  before update on public.items
  for each row
  execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 5. FUNCTION: search_items(search_query text)
-- ----------------------------------------------------------------------------
-- Full-text search di items yang sudah dipublikasikan.
-- Mengembalikan kolom item + info kategori (nama, slug, color, icon).
-- Diurutkan berdasarkan relevansi (ts_rank).

create or replace function public.search_items(search_query text)
returns table (
  id              uuid,
  category_id     uuid,
  category_name   text,
  category_slug   text,
  category_color  text,
  category_icon   text,
  subcategory     text,
  title           text,
  slug            text,
  description     text,
  thumbnail_url   text,
  address         text,
  district        text,
  tags            text[],
  is_verified     boolean,
  rank            real
)
language sql
stable
security definer
set search_path = public
as $$
  select
    i.id,
    i.category_id,
    c.name  as category_name,
    c.slug  as category_slug,
    c.color as category_color,
    c.icon  as category_icon,
    i.subcategory,
    i.title,
    i.slug,
    i.description,
    i.thumbnail_url,
    i.address,
    i.district,
    i.tags,
    i.is_verified,
    ts_rank(
      to_tsvector(
        'simple',
        coalesce(i.title, '') || ' ' ||
        coalesce(i.description, '') || ' ' ||
        coalesce(i.content, '') || ' ' ||
        coalesce(i.address, '')
      ),
      websearch_to_tsquery('simple', search_query)
    ) as rank
  from public.items i
  join public.categories c on c.id = i.category_id
  where i.is_published = true
    and (
      to_tsvector(
        'simple',
        coalesce(i.title, '') || ' ' ||
        coalesce(i.description, '') || ' ' ||
        coalesce(i.content, '') || ' ' ||
        coalesce(i.address, '')
      ) @@ websearch_to_tsquery('simple', search_query)
      or i.title ilike '%' || search_query || '%'
      or search_query = any(i.tags)
    )
  order by rank desc, i.view_count desc
  limit 50;
$$;


-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

alter table public.categories  enable row level security;
alter table public.items       enable row level security;
alter table public.admin_users enable row level security;

-- Helper: cek apakah user saat ini adalah admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- ---- Policies: categories ----
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories
  for select
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
  on public.categories
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Policies: items ----
-- Public: hanya boleh SELECT item yang sudah dipublikasikan
drop policy if exists "items_select_published" on public.items;
create policy "items_select_published"
  on public.items
  for select
  using (is_published = true);

-- Admin: boleh SELECT semua (termasuk draft)
drop policy if exists "items_admin_select_all" on public.items;
create policy "items_admin_select_all"
  on public.items
  for select
  to authenticated
  using (public.is_admin());

-- Admin: INSERT, UPDATE, DELETE
drop policy if exists "items_admin_insert" on public.items;
create policy "items_admin_insert"
  on public.items
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "items_admin_update" on public.items;
create policy "items_admin_update"
  on public.items
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "items_admin_delete" on public.items;
create policy "items_admin_delete"
  on public.items
  for delete
  to authenticated
  using (public.is_admin());

-- ---- Policies: admin_users ----
-- Hanya authenticated user yang boleh SELECT (untuk cek status dirinya sendiri / dashboard)
drop policy if exists "admin_users_select_authenticated" on public.admin_users;
create policy "admin_users_select_authenticated"
  on public.admin_users
  for select
  to authenticated
  using (true);


-- ----------------------------------------------------------------------------
-- 7. SEED DATA
-- ----------------------------------------------------------------------------

-- ---- 4 kategori utama ----
insert into public.categories (name, slug, description, icon, color, order_index) values
  ('Birokrasi & Layanan', 'birokrasi', 'Panduan layanan pemerintah dan administrasi kependudukan', 'building-2', '#2563EB', 1),
  ('Wisata',              'wisata',    'Destinasi wisata alam, religi, dan budaya di Tuban',       'map-pin',    '#16A34A', 2),
  ('Kuliner',             'kuliner',   'Rekomendasi tempat makan dan kuliner khas Tuban',          'utensils',   '#EA580C', 3),
  ('Jasa & Layanan',      'jasa',      'Rental, percetakan, bengkel, dan jasa lokal Tuban',        'wrench',     '#7C3AED', 4)
on conflict (slug) do nothing;


-- ---- 3 item birokrasi ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'KTP',
  'Pembuatan KTP Baru',
  'pembuatan-ktp-baru',
  'Panduan lengkap pembuatan KTP baru untuk warga Tuban yang sudah berusia 17 tahun atau sudah menikah.',
  E'# Pembuatan KTP Baru\n\n## Siapa yang Wajib Membuat KTP?\n\nWarga Negara Indonesia yang sudah berusia 17 tahun atau sudah menikah wajib memiliki KTP (Kartu Tanda Penduduk).\n\n## Syarat yang Harus Disiapkan\n\n1. Surat pengantar dari RT/RW setempat\n2. Fotokopi Kartu Keluarga (KK)\n3. Pas foto berwarna ukuran 3x4 dengan background merah sebanyak 2 lembar\n4. Dokumen asli untuk verifikasi\n\n## Prosedur\n\n1. Datang ke kantor Kecamatan atau Dinas Dukcapil Tuban di jam kerja\n2. Ambil nomor antrean di loket pendaftaran\n3. Serahkan berkas ke petugas\n4. Lakukan proses perekaman (foto, sidik jari, tanda tangan)\n5. Tunggu proses pencetakan KTP\n\n## Biaya\n\nGratis (sesuai UU No. 24 Tahun 2013).\n\n## Estimasi Waktu\n\n1-3 hari kerja untuk KTP elektronik standar.',
  'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tuban',
  'Tuban',
  true,
  '{"syarat": ["Surat pengantar RT/RW", "Fotokopi KK", "Pas foto 3x4 background merah 2 lembar"], "biaya": "Gratis", "estimasi_waktu": "1-3 hari kerja", "catatan": "Bawa dokumen asli untuk verifikasi"}'::jsonb
from public.categories c where c.slug = 'birokrasi'
on conflict (slug) do nothing;

insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'KTP',
  'Penggantian KTP Rusak atau Hilang',
  'penggantian-ktp-rusak-hilang',
  'Panduan penggantian KTP yang rusak, hilang, atau habis masa berlakunya di Tuban.',
  E'# Penggantian KTP Rusak atau Hilang\n\n## Kapan KTP Perlu Diganti?\n\n- KTP hilang\n- KTP rusak (sobek, terbakar, data tidak terbaca)\n- Data pada KTP berubah (nama, alamat, status perkawinan, dsb)\n\n## Perbedaan Prosedur\n\n### Jika KTP Hilang\n\n1. Buat **Surat Keterangan Kehilangan** di kantor polisi terdekat\n2. Siapkan fotokopi KK\n3. Siapkan pas foto 3x4 background merah 2 lembar\n4. Datang ke Dinas Dukcapil dengan berkas tersebut\n\n### Jika KTP Rusak\n\n1. Bawa KTP lama yang rusak (sebagai bukti)\n2. Siapkan fotokopi KK\n3. Siapkan pas foto 3x4 background merah 2 lembar\n4. Datang ke Dinas Dukcapil\n\n## Biaya\n\nGratis.\n\n## Estimasi Waktu\n\n1-3 hari kerja.',
  'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tuban',
  'Tuban',
  true,
  '{"syarat_hilang": ["Surat keterangan kehilangan dari Kepolisian", "Fotokopi KK", "Pas foto"], "syarat_rusak": ["KTP lama yang rusak", "Fotokopi KK", "Pas foto"], "biaya": "Gratis", "estimasi_waktu": "1-3 hari kerja"}'::jsonb
from public.categories c where c.slug = 'birokrasi'
on conflict (slug) do nothing;

insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Kartu Keluarga',
  'Perubahan Data Kartu Keluarga',
  'perubahan-data-kartu-keluarga',
  'Panduan perubahan data Kartu Keluarga (KK) karena pindah domisili, kelahiran, kematian, atau pernikahan.',
  E'# Perubahan Data Kartu Keluarga\n\n## Jenis Perubahan KK\n\n1. **Penambahan anggota keluarga baru lahir** — bayi yang baru lahir\n2. **Pengurangan anggota karena meninggal** — anggota keluarga yang meninggal dunia\n3. **Perubahan karena pernikahan** — pembuatan KK baru untuk pasangan baru\n4. **Pindah domisili** — pindah alamat dalam/luar Tuban\n\n## Syarat Umum\n\n- KK lama (asli + fotokopi)\n- KTP seluruh anggota keluarga (fotokopi)\n- Surat pengantar RT/RW\n\n## Syarat Tambahan (tergantung jenis perubahan)\n\n- **Kelahiran**: Surat Keterangan Lahir dari bidan/rumah sakit\n- **Kematian**: Surat Keterangan Kematian dari kelurahan/rumah sakit\n- **Pernikahan**: Buku Nikah / Akta Nikah\n- **Pindah domisili**: Surat Keterangan Pindah dari daerah asal\n\n## Prosedur\n\n1. Kumpulkan berkas sesuai jenis perubahan\n2. Datang ke Kantor Kelurahan/Desa untuk verifikasi awal\n3. Lanjut ke Kecamatan atau Dinas Dukcapil Tuban\n4. Serahkan berkas ke petugas\n5. Tunggu proses pencetakan KK baru\n\n## Biaya\n\nGratis.\n\n## Estimasi Waktu\n\n1-7 hari kerja.',
  'Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tuban',
  'Tuban',
  true,
  '{"jenis_perubahan": ["Penambahan anggota keluarga baru lahir", "Pengurangan karena meninggal", "Perubahan karena menikah", "Pindah domisili"], "biaya": "Gratis", "estimasi_waktu": "1-7 hari kerja"}'::jsonb
from public.categories c where c.slug = 'birokrasi'
on conflict (slug) do nothing;


-- ---- 3 item wisata ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, gmaps_url, lat, lng, is_published, metadata
)
select
  c.id,
  'Wisata Alam',
  'Pantai Boom Tuban',
  'pantai-boom-tuban',
  'Pantai ikonik di pusat kota Tuban dengan pemandangan sunset yang indah dan dermaga bersejarah.',
  E'# Pantai Boom Tuban\n\n## Tentang Pantai Boom\n\nPantai Boom adalah salah satu ikon wisata Kabupaten Tuban yang berlokasi tepat di pusat kota. Nama "Boom" berasal dari sejarah Belanda yang dulu menggunakan kawasan ini sebagai pelabuhan peti kemas (boom = pelabuhan).\n\n## Daya Tarik\n\n- Dermaga panjang yang menjorok ke laut, cocok untuk foto\n- Sunset yang indah di sore hari\n- Area bermain anak\n- Deretan warung kuliner khas Tuban\n\n## Fasilitas\n\n- Area parkir luas (motor & mobil)\n- Toilet umum\n- Warung makan dan minuman\n- Gazebo untuk bersantai\n- Musholla\n\n## Tips Berkunjung\n\n1. Datang sore hari (sekitar jam 16.00 WIB) untuk menikmati sunset terbaik\n2. Bawa topi/payung jika datang siang hari karena cukup panas\n3. Coba kuliner khas seperti kelapa muda dan seafood\n4. Hindari berenang di area dermaga karena bukan pantai untuk berenang\n\n## Akses\n\nPantai Boom berada sekitar 1 km dari alun-alun Tuban. Mudah dijangkau dengan kendaraan pribadi maupun angkot.',
  'Jl. Martadinata, Kutorejo, Kec. Tuban',
  'Tuban',
  'https://maps.google.com/?q=Pantai+Boom+Tuban',
  -6.8994,
  112.0510,
  true,
  '{"harga_tiket": "Rp 5.000 - Rp 10.000", "jam_buka": "24 jam", "fasilitas": ["Area parkir", "Toilet umum", "Warung makan", "Gazebo"], "tips": "Datang sore hari untuk menikmati sunset terbaik"}'::jsonb
from public.categories c where c.slug = 'wisata'
on conflict (slug) do nothing;

insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, gmaps_url, lat, lng, is_published, metadata
)
select
  c.id,
  'Wisata Alam',
  'Goa Akbar',
  'goa-akbar',
  'Goa alam megah dengan stalaktit dan stalagmit menakjubkan, terletak di tengah kota Tuban.',
  E'# Goa Akbar\n\n## Tentang Goa Akbar\n\nGoa Akbar adalah goa alam yang unik karena berada di tengah kota Tuban. Goa ini memiliki ornamen stalaktit dan stalagmit yang terbentuk secara alami selama ribuan tahun dan menjadi salah satu daya tarik utama wisata Tuban.\n\n## Sejarah Singkat\n\nGoa ini diyakini sudah ada sejak zaman Majapahit dan pernah digunakan sebagai tempat pertapaan para wali dan tokoh kerajaan.\n\n## Yang Bisa Dilihat\n\n- Stalaktit dan stalagmit yang megah\n- Aliran air bawah tanah\n- Beberapa ruangan besar di dalam goa\n- Pencahayaan artistik yang menambah keindahan\n\n## Fasilitas\n\n- Pemandu wisata lokal\n- Area parkir\n- Toilet\n- Musholla\n- Warung di sekitar area\n\n## Tips Berkunjung\n\n1. Gunakan alas kaki yang nyaman dan tidak licin\n2. Bawa jaket tipis karena suhu di dalam goa cukup sejuk\n3. Ikuti petunjuk pemandu untuk keamanan\n4. Hindari berpisah dari rombongan karena medan dalam goa cukup berliku\n\n## Akses\n\nGoa Akbar terletak di Jl. Akbar, sekitar 2 km dari pusat kota Tuban. Mudah dijangkau dengan kendaraan pribadi.',
  'Jl. Akbar, Sendangharjo, Kec. Tuban',
  'Tuban',
  'https://maps.google.com/?q=Goa+Akbar+Tuban',
  -6.9014,
  112.0486,
  true,
  '{"harga_tiket": "Rp 10.000", "jam_buka": "08.00 - 16.00 WIB", "fasilitas": ["Pemandu wisata", "Area parkir", "Toilet", "Mushola"], "tips": "Gunakan alas kaki yang nyaman karena medan di dalam goa cukup licin"}'::jsonb
from public.categories c where c.slug = 'wisata'
on conflict (slug) do nothing;

insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, gmaps_url, lat, lng, is_published, metadata
)
select
  c.id,
  'Wisata Religi',
  'Makam Sunan Bonang',
  'makam-sunan-bonang',
  'Makam salah satu Wali Songo yang menjadi destinasi ziarah utama di Tuban.',
  E'# Makam Sunan Bonang\n\n## Tentang Makam Sunan Bonang\n\nSunan Bonang (Raden Makdum Ibrahim) adalah salah satu dari Wali Songo yang berperan besar dalam menyebarkan Islam di tanah Jawa, khususnya di wilayah pesisir utara. Beliau wafat di Tuban dan dimakamkan di kompleks makam ini.\n\n## Tata Cara Ziarah\n\n1. Masuk melalui gerbang utama dengan sikap sopan\n2. Lepas alas kaki di area yang sudah disediakan\n3. Wudhu terlebih dahulu (tempat wudhu tersedia)\n4. Baca doa dan tahlil di depan makam\n5. Menjaga ketenangan dan tidak berbicara keras\n\n## Fasilitas\n\n- Area parkir luas (motor & mobil)\n- Toilet umum\n- Tempat wudhu\n- Musholla/masjid besar di sebelah makam\n- Warung makan dan oleh-oleh di sekitar\n- Penginapan (untuk peziarah dari luar kota)\n\n## Tips Berkunjung\n\n1. Kenakan pakaian sopan yang menutup aurat\n2. Datang di luar jam sholat untuk menghindari kepadatan\n3. Siapkan uang receh untuk infaq\n4. Mampir ke pasar oleh-oleh di sekitar makam — banyak kuliner khas Tuban\n\n## Akses\n\nMakam Sunan Bonang berada di pusat kota Tuban, sebelah barat alun-alun. Sangat mudah dijangkau dengan kendaraan pribadi, angkot, atau berjalan kaki dari alun-alun.',
  'Jl. KH Mustain, Kutorejo, Kec. Tuban',
  'Tuban',
  'https://maps.google.com/?q=Makam+Sunan+Bonang+Tuban',
  -6.8966,
  112.0494,
  true,
  '{"harga_tiket": "Gratis", "jam_buka": "24 jam", "fasilitas": ["Area parkir", "Toilet", "Tempat wudhu", "Warung sekitar"], "tips": "Kenakan pakaian sopan dan menutup aurat saat berziarah"}'::jsonb
from public.categories c where c.slug = 'wisata'
on conflict (slug) do nothing;


-- ============================================================================
-- SELESAI.
-- Setelah menjalankan file ini, tambahkan diri Anda ke tabel admin_users
-- agar bisa mengelola konten dari /admin panel:
--
--   insert into public.admin_users (id, email)
--   values ('<uid dari auth.users>', 'email@anda.com');
--
-- UID bisa dilihat di Supabase Dashboard → Authentication → Users.
-- ============================================================================
