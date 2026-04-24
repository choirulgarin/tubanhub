/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Generate semua icon PWA untuk TubanHub.
 *
 * Output: public/icons/icon-{size}x{size}.png dengan ukuran 72/96/128/144/152/192/384/512
 * plus dua shortcut icon (birokrasi, wisata).
 *
 * Dijalankan dengan: node scripts/generate-icons.js
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

const PRIMARY = '#2563EB';      // biru TubanHub
const SECONDARY = '#16A34A';    // hijau aksen

// SVG utama: gradient biru→hijau + huruf "T" putih besar di tengah.
// Dibungkus dengan safe-area agar tetap bagus saat di-mask (PWA maskable icon).
function mainSvg(size) {
  const fontSize = Math.round(size * 0.55);
  const radius = Math.round(size * 0.22);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${PRIMARY}"/>
      <stop offset="100%" stop-color="${SECONDARY}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-weight="800" font-size="${fontSize}" fill="#ffffff">T</text>
</svg>`;
}

// SVG untuk shortcut — background warna kategori + simbol sederhana.
function shortcutSvg(size, bgColor, symbol) {
  const fontSize = Math.round(size * 0.55);
  const radius = Math.round(size * 0.2);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bgColor}"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-weight="800" font-size="${fontSize}" fill="#ffffff">${symbol}</text>
</svg>`;
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Generate icon utama untuk semua ukuran
  for (const size of SIZES) {
    const out = path.join(OUT_DIR, `icon-${size}x${size}.png`);
    await sharp(Buffer.from(mainSvg(size)))
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`✓ ${path.relative(process.cwd(), out)}`);
  }

  // Favicon / Apple touch (alias ke 192)
  const appleTouch = path.join(OUT_DIR, 'apple-touch-icon.png');
  await sharp(Buffer.from(mainSvg(180))).png().toFile(appleTouch);
  console.log(`✓ ${path.relative(process.cwd(), appleTouch)}`);

  // Shortcut icons
  const shortcuts = [
    { file: 'shortcut-birokrasi.png', color: '#2563EB', symbol: 'B' },
    { file: 'shortcut-wisata.png',    color: '#16A34A', symbol: 'W' },
  ];
  for (const s of shortcuts) {
    const out = path.join(OUT_DIR, s.file);
    await sharp(Buffer.from(shortcutSvg(96, s.color, s.symbol)))
      .png()
      .toFile(out);
    console.log(`✓ ${path.relative(process.cwd(), out)}`);
  }

  console.log('\nSelesai. Total icon dihasilkan:', SIZES.length + 1 + shortcuts.length);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
