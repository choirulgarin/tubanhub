-- ============================================================================
-- TubanHub — Seed Data: Jasa & Layanan
-- ============================================================================
-- 5 item jasa lokal Tuban.
-- Idempotent: aman dijalankan berulang (on conflict (slug) do nothing).
-- ============================================================================


-- ---- a) Rental Mobil Tuban Jaya ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Rental Kendaraan',
  'Rental Mobil Tuban Jaya',
  'rental-mobil-tuban-jaya',
  'Rental mobil terpercaya di Tuban dengan armada lengkap dan harga terjangkau.',
  E'# Rental Mobil Tuban Jaya\n\n## Tentang\n\nPenyedia **jasa rental mobil** terpercaya di Tuban. Menyediakan berbagai tipe kendaraan untuk kebutuhan perjalanan keluarga, acara kantor, hingga perjalanan dinas.\n\n## Armada Tersedia\n\n- **Toyota Avanza** — mobil keluarga 7 penumpang\n- **Toyota Innova** — kelas lebih nyaman, cocok perjalanan jauh\n- **Toyota Hiace** — kapasitas 14-16 penumpang untuk rombongan\n- **Isuzu Elf** — 16-18 penumpang, pas untuk wisata grup besar\n\n## Harga\n\nMulai **Rp 250.000/hari** — tergantung tipe kendaraan dan durasi sewa.\n\n## Paket Layanan\n\n- **Lepas Kunci** (tanpa driver) — untuk pelanggan yang bisa menyetir sendiri\n- **Dengan Driver** — driver berpengalaman dengan wilayah Tuban dan sekitarnya\n- **Paket Wisata** — termasuk driver, BBM sesuai rute, dan asuransi dasar\n\n## Include\n\n- BBM (untuk paket tertentu)\n- Driver (opsional)\n- Asuransi\n- Free air mineral\n\n## Syarat Sewa\n\n1. KTP asli + fotokopi\n2. SIM A yang masih berlaku (untuk lepas kunci)\n3. Deposit sesuai ketentuan\n4. Surat keterangan kerja/mahasiswa (untuk pelanggan baru)\n\n## Area Layanan\n\nTuban dan sekitarnya — termasuk perjalanan ke Surabaya, Malang, Jogja, dan kota-kota di Jawa Tengah.',
  'Jl. Raya Tuban, Tuban',
  'Tuban',
  true,
  '{"harga_mulai": "Rp 250.000/hari", "armada": ["Avanza", "Innova", "Hiace", "Elf"], "area_layanan": "Tuban dan sekitarnya", "include": ["BBM", "Driver (opsional)", "Asuransi"]}'::jsonb
from public.categories c where c.slug = 'jasa'
on conflict (slug) do nothing;


-- ---- b) Motor Rental Pak Slamet ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Rental Kendaraan',
  'Motor Rental Pak Slamet',
  'motor-rental-pak-slamet',
  'Rental motor harian dan mingguan untuk keliling Tuban.',
  E'# Motor Rental Pak Slamet\n\n## Tentang\n\nPenyewaan **motor matic** dengan tarif ramah kantong — cocok untuk wisatawan yang ingin menjelajah Tuban secara fleksibel, atau warga yang butuh kendaraan tambahan.\n\n## Armada\n\n- **Honda Vario 125** — nyaman untuk perjalanan jauh\n- **Honda Beat** — irit dan gesit untuk dalam kota\n- **Yamaha Mio** — praktis dan mudah dikendarai\n- **Honda Scoopy** — gaya retro, cocok untuk foto-foto wisata\n\n## Harga\n\nMulai **Rp 75.000/hari**. Ada diskon untuk sewa mingguan/bulanan.\n\n## Include\n\n- 2 helm standar\n- Jas hujan\n- STNK (asli dipegang penyewa)\n\n## Syarat Sewa\n\n1. KTP asli (ditahan selama masa sewa)\n2. SIM C masih berlaku\n3. Deposit Rp 200.000 (dikembalikan saat motor dikembalikan dalam kondisi baik)\n4. Khusus pelanggan baru: tambahan kartu identitas (KTM/KTA/BPJS)\n\n## Area Layanan\n\nTuban kota. Motor boleh dibawa keluar kota dengan pemberitahuan sebelumnya.\n\n## Tips\n\n- Booking 1-2 hari sebelumnya saat high season (liburan panjang)\n- Kembalikan motor dalam kondisi bersih dan tangki minimal sesuai saat ambil\n- Ada layanan antar-jemput motor (dengan biaya tambahan)',
  null,
  'Tuban',
  true,
  '{"harga_mulai": "Rp 75.000/hari", "armada": ["Vario 125", "Beat", "Mio", "Scoopy"], "area_layanan": "Tuban kota", "include": ["Helm", "Jas hujan"]}'::jsonb
from public.categories c where c.slug = 'jasa'
on conflict (slug) do nothing;


-- ---- c) Percetakan Digital Tuban Print ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Percetakan',
  'Percetakan Digital Tuban Print',
  'percetakan-digital-tuban-print',
  'Jasa cetak banner, spanduk, undangan, dan kebutuhan percetakan lainnya.',
  E'# Percetakan Digital Tuban Print\n\n## Tentang\n\n**Percetakan digital** dengan layanan lengkap untuk kebutuhan pribadi, usaha, maupun event. Menerima pesanan **satuan** hingga **skala besar**.\n\n## Layanan\n\n### Banner & Spanduk\n- Bahan: flexy Jerman, frontlite, backlite\n- Ukuran: custom sesuai kebutuhan\n- Hasil print resolusi tinggi, tidak mudah luntur\n\n### Undangan\n- Pilihan desain: klasik, modern, islami, custom\n- Bahan: art carton, BW, jasmine, dengan berbagai finishing\n- Minimal order: 25 pcs\n\n### Stiker\n- Stiker label, cutting, transparan, hologram\n- Cocok untuk kemasan produk atau dekorasi\n\n### Kartu Nama\n- Art carton 260 gr dengan finishing doff/glossy\n- Minimal order: 1 box (100 pcs)\n\n### Brosur, Flyer, Katalog\n- Beragam ukuran (A4, A5, folded)\n- Full color quality offset\n\n## Harga\n\nMulai **Rp 10.000** (tergantung jenis, ukuran, dan jumlah).\n\n## Jam Operasional\n\n**08.00 - 21.00 WIB** — Senin sampai Minggu.\n\n## Tips\n\n1. Siapkan file desain dalam format **PDF, CDR, atau AI** (high res)\n2. Untuk order mendesak, hubungi dulu via WhatsApp\n3. Ada jasa desain (dengan biaya tambahan) jika belum punya desain sendiri\n4. Pengerjaan express (same day) tersedia untuk beberapa produk',
  null,
  'Tuban',
  true,
  '{"harga_mulai": "Rp 10.000", "layanan": ["Banner & Spanduk", "Undangan", "Stiker", "Kartu Nama", "Brosur"], "jam_operasional": "08.00 - 21.00 WIB"}'::jsonb
from public.categories c where c.slug = 'jasa'
on conflict (slug) do nothing;


-- ---- d) Bengkel Motor Tuban Jaya ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Bengkel',
  'Bengkel Motor Tuban Jaya',
  'bengkel-motor-tuban-jaya',
  'Bengkel motor resmi dan umum dengan teknisi berpengalaman di Tuban.',
  E'# Bengkel Motor Tuban Jaya\n\n## Tentang\n\nBengkel motor **resmi dan umum** dengan teknisi berpengalaman. Melayani hampir semua merk motor — Honda, Yamaha, Suzuki, Kawasaki, hingga motor listrik.\n\n## Layanan\n\n### Servis Rutin\n- Tune up lengkap\n- Pembersihan karburator/injektor\n- Pengecekan rem, kopling, dan transmisi\n\n### Ganti Oli\n- Oli mesin (berbagai merk dan kekentalan)\n- Oli gardan\n- Oli matic CVT\n\n### Tambal Ban\n- Tambal tubeless\n- Ganti ban dalam\n- Balancing roda\n\n### Spare Part\n- Part original (OEM) dan aftermarket berkualitas\n- Tersedia rem, kampas, busi, aki, dan sparepart umum lain\n\n### Tune Up\n- Paket perawatan lengkap untuk performa optimal\n- Cocok dilakukan setiap 3-6 bulan sekali\n\n## Harga\n\nMulai **Rp 15.000** (tambal ban) — harga servis dan ganti part menyesuaikan kebutuhan.\n\n## Jam Operasional\n\n**08.00 - 17.00 WIB** — Senin sampai Sabtu. Minggu libur.\n\n## Tips\n\n1. Datang pagi (sebelum 10.00) untuk antrian lebih cepat\n2. Booking via WhatsApp untuk perbaikan besar\n3. Selalu simpan nota servis untuk catatan maintenance motor\n4. Tanyakan garansi untuk spare part yang dipasang',
  null,
  'Tuban',
  true,
  '{"harga_mulai": "Rp 15.000", "layanan": ["Servis rutin", "Ganti oli", "Tambal ban", "Tune up", "Spare part"], "jam_operasional": "08.00 - 17.00 WIB"}'::jsonb
from public.categories c where c.slug = 'jasa'
on conflict (slug) do nothing;


-- ---- e) Laundry Bersih Tuban ----
insert into public.items (
  category_id, subcategory, title, slug, description, content,
  address, district, is_published, metadata
)
select
  c.id,
  'Lainnya',
  'Laundry Bersih Tuban',
  'laundry-bersih-tuban',
  'Jasa laundry kiloan dan satuan dengan hasil bersih dan wangi.',
  E'# Laundry Bersih Tuban\n\n## Tentang\n\n**Jasa laundry** dengan hasil bersih, wangi, dan rapi. Cocok untuk pekerja, mahasiswa, keluarga sibuk, maupun pelanggan khusus yang butuh penanganan bahan tertentu.\n\n## Layanan\n\n### Cuci Kiloan\n- Paling ekonomis untuk pakaian harian\n- Minimum 3 kg\n- Waktu pengerjaan: 2-3 hari (reguler), 1 hari (express)\n\n### Cuci Satuan\n- Untuk item khusus: jaket, selimut, gorden, karpet\n- Harga per item\n\n### Dry Cleaning\n- Untuk bahan delicate: jas, batik sutra, gaun, beskap\n- Menggunakan bahan pembersih khusus, tidak merusak serat\n\n### Setrika\n- Paket setrika saja (tanpa cuci)\n- Hasil rapi siap pakai\n\n## Harga\n\nMulai **Rp 6.000/kg** (cuci reguler kiloan). Dry cleaning dan satuan menyesuaikan jenis barang.\n\n## Jam Operasional\n\n**07.00 - 21.00 WIB** — Senin sampai Minggu.\n\n## Tips\n\n1. Pisahkan pakaian putih dan berwarna saat setor untuk hasil terbaik\n2. Tandai pakaian khusus yang butuh perlakuan hati-hati\n3. Tersedia layanan **pick-up & delivery** (area Tuban kota)\n4. Paket langganan bulanan ada diskon khusus',
  null,
  'Tuban',
  true,
  '{"harga_mulai": "Rp 6.000/kg", "layanan": ["Cuci kiloan", "Cuci satuan", "Dry cleaning", "Setrika"], "jam_operasional": "07.00 - 21.00 WIB"}'::jsonb
from public.categories c where c.slug = 'jasa'
on conflict (slug) do nothing;


-- ============================================================================
-- SELESAI. Total: 5 item jasa.
-- ============================================================================
