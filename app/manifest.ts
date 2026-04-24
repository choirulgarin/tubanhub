import type { MetadataRoute } from 'next';

// Next.js native manifest API — di-serve di /manifest.webmanifest.
// File ini berfungsi sebagai fallback / source of truth kedua setelah public/manifest.json.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TubanHub',
    short_name: 'TubanHub',
    description: 'Semua tentang Tuban, dalam satu genggaman',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#2563EB',
    lang: 'id',
    dir: 'ltr',
    categories: ['government', 'travel', 'lifestyle'],
    icons: [
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Birokrasi',
        short_name: 'Birokrasi',
        description: 'Panduan layanan pemerintah di Tuban',
        url: '/birokrasi',
        icons: [{ src: '/icons/shortcut-birokrasi.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Wisata',
        short_name: 'Wisata',
        description: 'Destinasi wisata Tuban',
        url: '/wisata',
        icons: [{ src: '/icons/shortcut-wisata.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
  };
}
