-- ============================================================================
-- Migration 003 — Update seed items content ke format Markdown
-- ============================================================================
-- Field `content` sebelumnya disimpan sebagai plain text. Sejak komponen
-- RichContent (react-markdown + remark-gfm) dipakai di detail page,
-- konten di-render sebagai Markdown (heading, list, blockquote, dll).
--
-- Migrasi ini memperbarui 6 seed item (3 birokrasi + 3 wisata) ke Markdown.
-- Idempotent: aman dijalankan ulang, hanya meng-overwrite kolom content.
-- ============================================================================

UPDATE public.items SET content = '## Persyaratan

Berikut dokumen yang perlu disiapkan:

- Surat pengantar RT/RW
- Fotokopi Kartu Keluarga (KK)
- Pas foto ukuran 3x4 background **merah** sebanyak 2 lembar
- Dokumen asli untuk verifikasi

## Prosedur

1. Datang ke **Dinas Kependudukan dan Pencatatan Sipil** Kabupaten Tuban
2. Ambil nomor antrian di loket pendaftaran
3. Serahkan berkas persyaratan ke petugas
4. Tunggu proses verifikasi dokumen
5. KTP akan dicetak dan dapat diambil sesuai estimasi waktu

## Informasi Penting

> Layanan pembuatan KTP baru **tidak dipungut biaya** (gratis). Waspada terhadap oknum yang meminta bayaran.

## Estimasi Waktu

Proses pembuatan KTP baru membutuhkan waktu **1-3 hari kerja** setelah berkas dinyatakan lengkap.

## Lokasi

Dinas Kependudukan dan Pencatatan Sipil Kabupaten Tuban
Jalan Basuki Rahmat No. 1, Tuban
Senin - Jumat: 08.00 - 14.00 WIB'
WHERE slug = 'pembuatan-ktp-baru';

UPDATE public.items SET content = '## Persyaratan KTP Hilang

- Surat keterangan kehilangan dari **Kepolisian** (Polsek/Polres Tuban)
- Fotokopi Kartu Keluarga (KK)
- Pas foto ukuran 3x4 background **merah** sebanyak 2 lembar

## Persyaratan KTP Rusak

- KTP lama yang rusak (wajib dibawa)
- Fotokopi Kartu Keluarga (KK)
- Pas foto ukuran 3x4 background **merah** sebanyak 2 lembar

## Prosedur

1. Siapkan seluruh dokumen persyaratan
2. Datang ke **Dinas Dukcapil** Kabupaten Tuban
3. Ambil nomor antrian dan serahkan berkas
4. Petugas akan memverifikasi laporan kehilangan/kerusakan
5. Tunggu proses pencetakan KTP baru

## Informasi Penting

> Layanan penggantian KTP **gratis**. Untuk KTP hilang, surat kehilangan dari kepolisian **wajib** dilampirkan.

## Estimasi Waktu

**1-3 hari kerja** setelah berkas lengkap dan terverifikasi.'
WHERE slug = 'penggantian-ktp-rusak-atau-hilang';

UPDATE public.items SET content = '## Jenis Perubahan Data KK

Perubahan Kartu Keluarga dapat dilakukan untuk berbagai kondisi:

### Penambahan Anggota Keluarga (Bayi Baru Lahir)
- Surat keterangan lahir dari rumah sakit/bidan
- KK asli orang tua
- Buku nikah orang tua

### Pengurangan Anggota (Meninggal Dunia)
- Surat keterangan kematian
- KK asli

### Perubahan karena Pernikahan
- Buku nikah/akta perkawinan
- KK masing-masing pihak
- KTP kedua mempelai

### Pindah Domisili
- Surat keterangan pindah dari daerah asal
- KK asli

## Prosedur Umum

1. Siapkan dokumen sesuai jenis perubahan
2. Datang ke **Dinas Dukcapil** Kabupaten Tuban
3. Isi formulir permohonan perubahan data
4. Serahkan berkas ke petugas
5. Ambil KK baru sesuai estimasi

> Proses perubahan KK **gratis** dan membutuhkan waktu **1-7 hari kerja**.'
WHERE slug = 'perubahan-data-kartu-keluarga';

UPDATE public.items SET content = '## Tentang Pantai Boom Tuban

Pantai Boom adalah destinasi wisata ikonik yang terletak di pusat kota Tuban, tepat di tepi Laut Jawa. Pantai ini menjadi favorit warga lokal maupun wisatawan karena aksesnya yang mudah dan pemandangannya yang indah.

## Daya Tarik Utama

- **Sunset spektakuler** — Salah satu spot terbaik menikmati matahari terbenam di Tuban
- **Dekat pusat kota** — Hanya beberapa menit dari alun-alun Tuban
- **Area yang luas** — Cocok untuk piknik keluarga dan olahraga sore
- **Kuliner pinggir pantai** — Banyak warung dengan menu seafood segar

## Fasilitas

- Area parkir luas
- Toilet umum
- Warung makan dan minuman
- Gazebo dan area duduk
- Jogging track

## Tips Berkunjung

> Datanglah sekitar pukul **16.00 - 18.00 WIB** untuk menikmati sunset terbaik. Hindari berkunjung saat musim hujan karena ombak bisa lebih besar.

## Cara Menuju Lokasi

Pantai Boom dapat dijangkau dengan mudah dari pusat kota Tuban:
- **Dari Alun-alun Tuban**: ±5 menit berkendara ke arah utara
- **Dari Terminal Tuban**: ±10 menit berkendara'
WHERE slug = 'pantai-boom-tuban';

UPDATE public.items SET content = '## Tentang Goa Akbar

Goa Akbar adalah salah satu keajaiban alam yang tersembunyi di dalam kota Tuban. Goa ini memiliki stalaktit dan stalagmit yang terbentuk selama ribuan tahun, menciptakan pemandangan yang menakjubkan di dalam perut bumi.

## Keunikan Goa Akbar

- **Berada di dalam kota** — Uniknya, goa ini terletak di tengah pemukiman kota Tuban
- **Stalaktit dan Stalagmit** — Formasi batuan yang indah dengan berbagai bentuk unik
- **Tata cahaya** — Dilengkapi pencahayaan berwarna yang memperindah formasi batu
- **Nilai sejarah** — Dipercaya sebagai tempat pertapaan tokoh-tokoh bersejarah

## Fasilitas

- Pemandu wisata lokal
- Area parkir
- Toilet umum
- Mushola
- Warung di sekitar lokasi

## Tips Berkunjung

> Gunakan **alas kaki yang tertutup dan tidak licin** karena jalur di dalam goa cukup lembab. Ikuti instruksi pemandu untuk keselamatan.

## Jam Operasional

Senin - Minggu: **08.00 - 16.00 WIB**
Disarankan datang pagi hari saat pengunjung belum ramai.'
WHERE slug = 'goa-akbar';

UPDATE public.items SET content = '## Tentang Makam Sunan Bonang

Makam Sunan Bonang adalah salah satu destinasi ziarah paling penting di Jawa Timur. Sunan Bonang merupakan salah satu dari **Wali Songo** — sembilan wali yang berjasa menyebarkan agama Islam di Pulau Jawa.

## Sejarah Singkat

Sunan Bonang, bernama asli Raden Makhdum Ibrahim, adalah putra Sunan Ampel. Beliau dikenal sebagai wali yang menggunakan pendekatan seni dan budaya dalam dakwahnya, termasuk melalui gamelan dan tembang-tembang Jawa yang bernuansa Islami.

## Tata Cara Ziarah

1. Kenakan pakaian **sopan dan menutup aurat** sebelum memasuki area makam
2. Bagi wanita, disediakan mukena dan kerudung di pintu masuk
3. Baca doa ziarah dengan khusyuk
4. Jaga ketenangan dan kesopanan selama berada di area makam
5. Dilarang mengambil foto di dalam ruang utama makam

## Fasilitas

- Area parkir luas
- Toilet umum bersih
- Tempat wudhu
- Mushola
- Banyak warung dan toko oleh-oleh di sekitar

## Tips Berkunjung

> Makam ini buka **24 jam** dan tidak dipungut biaya masuk. Waktu terbaik berziarah adalah pagi hari (06.00 - 09.00) atau setelah subuh untuk suasana yang lebih khusyuk dan sejuk.'
WHERE slug = 'makam-sunan-bonang';
