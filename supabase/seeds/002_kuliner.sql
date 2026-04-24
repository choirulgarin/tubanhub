-- ============================================================================
-- TubanHub — Seed Data: Kuliner
-- ============================================================================
-- 5 item kuliner khas Tuban.
-- Idempotent: aman dijalankan berulang (on conflict (slug) do nothing).
-- ============================================================================


-- ---- a) Sego Boran Pak Mbok ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Makanan Khas',
  'Sego Boran Pak Mbok',
  'sego-boran-pak-mbok',
  'Kuliner legendaris khas Tuban berupa nasi dengan lauk tradisional yang kaya rempah.',
  E'# Sego Boran Pak Mbok\n\n## Tentang Sego Boran\n\nSego Boran adalah kuliner legendaris khas pesisir utara Jawa Timur, termasuk Tuban. Hidangan ini berupa nasi putih yang disajikan bersama beragam lauk tradisional dalam **boran** (bakul anyaman bambu khas pedagang tradisional).\n\n## Sejarah Singkat\n\nSego Boran sudah ada sejak puluhan tahun lalu dan awalnya dijajakan oleh para ibu menggunakan boran yang digendong di punggung. Warung Pak Mbok melestarikan tradisi ini sejak generasi pertama.\n\n## Cara Makan\n\n1. Pilih lauk yang diinginkan — bothok, pepes ikan, rempeyek, sambal, dan aneka gorengan\n2. Nasi disajikan di atas pincuk daun pisang\n3. Disiram kuah santan pedas khas Boran\n4. Nikmati selagi hangat\n\n## Menu Andalan\n\n- **Sego Boran Komplit** — paket nasi + aneka lauk\n- **Bothok** — pepes kelapa parut berbumbu\n- **Pepes Ikan** — ikan laut segar dibungkus daun pisang\n\n## Lokasi & Jam Buka\n\nWarung ini buka pagi hari dari **05.00 hingga 10.00 WIB** — datang pagi supaya tidak kehabisan.\n\n## Tips\n\n- Datang sebelum jam 08.00 untuk pilihan lauk paling lengkap\n- Cocok dijadikan sarapan khas saat berkunjung ke Tuban\n- Harga terjangkau, cocok untuk semua kalangan',
  'Jl. Basuki Rahmat, Tuban',
  'Tuban',
  true,
  '{"price_range": "Rp 8.000 - Rp 20.000", "halal": true, "menu_andalan": ["Sego Boran Komplit", "Bothok", "Pepes Ikan"], "jam_buka": "05.00 - 10.00 WIB"}'::jsonb
from public.categories c where c.slug = 'kuliner'
on conflict (slug) do nothing;


-- ---- b) Warung Legen Bu Sari ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Minuman Khas',
  'Warung Legen Bu Sari',
  'warung-legen-bu-sari',
  'Legen segar langsung dari pohon siwalan, minuman tradisional khas Tuban yang menyegarkan.',
  E'# Warung Legen Bu Sari\n\n## Tentang Legen\n\nLegen adalah minuman tradisional khas Tuban yang disadap langsung dari bunga pohon **siwalan** (lontar). Rasanya manis alami, sedikit asam, dan sangat menyegarkan — terutama diminum dingin di siang hari.\n\n## Proses Pembuatan\n\n1. Bunga pohon siwalan disadap pada pagi atau sore hari\n2. Air nira ditampung dalam **bumbung** (tabung bambu)\n3. Disaring dan disajikan dalam kondisi segar\n4. Jika didiamkan lebih dari sehari akan berfermentasi menjadi **tuak**\n\n## Menu Andalan\n\n- **Legen Segar** — nira siwalan baru sadap, paling manis dan segar\n- **Tuak Manis** — legen yang difermentasi ringan (kadar alkohol sangat rendah)\n- **Siwalan Muda** — daging buah siwalan yang kenyal dan manis\n\n## Tips Menikmati\n\n- Minum legen dalam kondisi dingin untuk sensasi maksimal\n- Paling pas diminum siang hari yang panas\n- Cocok dipadu dengan buah siwalan muda\n\n## Catatan\n\nLegen yang masih segar memiliki rasa manis alami. Semakin lama disimpan, rasanya akan berubah menjadi asam karena proses fermentasi alami.',
  'Jl. Veteran, Tuban',
  'Tuban',
  true,
  '{"price_range": "Rp 5.000 - Rp 15.000", "halal": true, "menu_andalan": ["Legen Segar", "Tuak Manis", "Siwalan Muda"], "jam_buka": "07.00 - 17.00 WIB"}'::jsonb
from public.categories c where c.slug = 'kuliner'
on conflict (slug) do nothing;


-- ---- c) Rumah Makan Seafood Boom ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Warung & Resto',
  'Rumah Makan Seafood Boom',
  'rumah-makan-seafood-boom',
  'Seafood segar dengan pemandangan langsung ke Pantai Boom Tuban.',
  E'# Rumah Makan Seafood Boom\n\n## Tentang\n\nRumah makan ini terkenal dengan sajian **seafood segar** hasil tangkapan nelayan Tuban. Lokasinya strategis di Kawasan Pantai Boom — cocok untuk makan sambil menikmati pemandangan laut dan sunset sore hari.\n\n## Menu Andalan\n\n- **Ikan Bakar** — berbagai pilihan (kakap, kerapu, kuwe) dengan bumbu khas\n- **Udang Goreng** — udang segar goreng tepung crispy\n- **Cumi Saus Padang** — cumi segar disiram saus padang pedas manis\n- **Kerang Rebus**, **Kepiting Saus Tiram**, dan menu seafood lainnya\n\n## Suasana\n\n- Tempat makan outdoor dengan view pantai\n- Ada area saung untuk lesehan keluarga\n- Cocok untuk makan siang, makan malam, atau sekadar ngopi sore\n\n## Tips\n\n1. Datang menjelang sunset (sekitar jam 17.00 WIB) untuk pengalaman terbaik\n2. Pesan ikan **dengan ukuran pilihan sendiri** — harga per kilogram\n3. Cocok untuk rombongan keluarga atau acara kecil\n4. Siapkan budget lebih jika memilih kepiting atau lobster\n\n## Fasilitas\n\n- Area parkir luas\n- Toilet\n- Musholla\n- Wifi (di beberapa area)',
  'Kawasan Pantai Boom, Tuban',
  'Tuban',
  true,
  '{"price_range": "Rp 25.000 - Rp 100.000", "halal": true, "menu_andalan": ["Ikan Bakar", "Udang Goreng", "Cumi Saus Padang"], "jam_buka": "10.00 - 22.00 WIB"}'::jsonb
from public.categories c where c.slug = 'kuliner'
on conflict (slug) do nothing;


-- ---- d) Kerupuk Udang Pak Haji ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Oleh-oleh & Camilan',
  'Kerupuk Udang Pak Haji',
  'kerupuk-udang-pak-haji',
  'Kerupuk udang home industry khas Tuban yang sudah terkenal sejak 1985.',
  E'# Kerupuk Udang Pak Haji\n\n## Tentang\n\nKerupuk Udang Pak Haji adalah **home industry** di Palang, Tuban, yang memproduksi kerupuk udang berkualitas sejak tahun **1985**. Sudah tiga generasi mempertahankan resep asli yang membuat kerupuk ini renyah dan gurih.\n\n## Proses Produksi\n\n1. Udang segar dari nelayan lokal dikupas dan dihaluskan\n2. Dicampur dengan tepung tapioka, bumbu, dan sedikit garam\n3. Adonan dicetak dan dikukus\n4. Dijemur 1-2 hari di bawah matahari langsung\n5. Dikemas dalam bentuk mentah (siap goreng) atau matang (siap santap)\n\n## Menu & Produk\n\n- **Kerupuk Udang Original** — kerupuk udang klasik rasa asli\n- **Kerupuk Ikan** — varian dengan bahan dasar ikan laut\n- **Amplang** — kerupuk ikan khas dengan tekstur lebih padat\n\n## Kemasan\n\nTersedia dalam ukuran **250 gram**, **500 gram**, dan **1 kilogram** — cocok untuk dibawa pulang sebagai oleh-oleh.\n\n## Tips\n\n- Pilih kerupuk mentah jika ingin menyimpan lebih lama\n- Goreng dengan minyak panas agar mekar sempurna dan renyah\n- Pas untuk oleh-oleh keluarga atau teman kantor\n- Tahan hingga 3 bulan jika disimpan dalam wadah kedap udara',
  'Jl. Raya Palang, Kec. Palang',
  'Palang',
  true,
  '{"price_range": "Rp 15.000 - Rp 50.000", "halal": true, "menu_andalan": ["Kerupuk Udang Original", "Kerupuk Ikan", "Amplang"], "jam_buka": "08.00 - 17.00 WIB"}'::jsonb
from public.categories c where c.slug = 'kuliner'
on conflict (slug) do nothing;


-- ---- e) Kafe Alun-Alun Tuban ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Kafe & Minuman',
  'Kafe Alun-Alun Tuban',
  'kafe-alun-alun-tuban',
  'Kafe modern dengan view alun-alun Tuban, cocok untuk nongkrong dan kerja.',
  E'# Kafe Alun-Alun Tuban\n\n## Tentang\n\nKafe modern di jantung kota Tuban dengan view langsung ke alun-alun. Cocok untuk **nongkrong santai**, **meeting kecil**, atau **kerja remote** karena wifi cepat dan suasana nyaman.\n\n## Menu Andalan\n\n- **Kopi Robusta Tuban** — biji kopi lokal diracik manual dengan berbagai metode (V60, espresso)\n- **Es Legen Kekinian** — signature drink, es legen dipadu susu dan topping unik\n- **Roti Bakar** — dengan berbagai pilihan topping (cokelat, keju, srikaya)\n- Menu makanan ringan: pasta, kentang goreng, nachos\n\n## Suasana\n\n- Indoor ber-AC dengan desain minimalis-industrial\n- Outdoor dengan view alun-alun, pas untuk sore/malam\n- Wifi kencang, banyak colokan\n- Musik volume sedang — kondusif untuk kerja\n\n## Fasilitas\n\n- Wifi gratis\n- Colokan di hampir semua meja\n- Toilet bersih\n- Area parkir di sekitar alun-alun\n- Musholla (di sekitar kafe)\n\n## Tips\n\n1. Datang sore (17.00-19.00) untuk menikmati suasana alun-alun\n2. Cocok untuk date, meeting klien, atau kerja solo\n3. Coba signature **Es Legen Kekinian** — khas dan tidak ada di tempat lain\n4. Weekend cukup ramai — datang lebih awal kalau butuh meja strategis',
  'Jl. Alun-Alun Utara, Tuban',
  'Tuban',
  true,
  '{"price_range": "Rp 15.000 - Rp 45.000", "halal": true, "menu_andalan": ["Kopi Robusta Tuban", "Es Legen Kekinian", "Roti Bakar"], "jam_buka": "09.00 - 23.00 WIB"}'::jsonb
from public.categories c where c.slug = 'kuliner'
on conflict (slug) do nothing;


-- ============================================================================
-- SELESAI. Total: 5 item kuliner.
-- ============================================================================
