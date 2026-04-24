import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import { cn } from '@/lib/utils';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Root layout — hanya membungkus html/body, font, meta PWA, dan Toaster.
// Navbar/Footer publik dipasang di app/(public)/layout.tsx. Admin punya layout
// sendiri di app/admin/(shell)/layout.tsx sehingga tidak kejatuhan Footer.
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'TubanHub — Semua tentang Tuban, dalam satu genggaman',
    template: '%s | TubanHub',
  },
  description:
    'Platform informasi terpadu untuk warga dan wisatawan Tuban, Jawa Timur.',
  applicationName: 'TubanHub',
  keywords: [
    'Tuban',
    'wisata Tuban',
    'kuliner Tuban',
    'layanan pemerintah Tuban',
    'KTP Tuban',
  ],
  authors: [{ name: 'TubanHub' }],
  creator: 'TubanHub',
  publisher: 'TubanHub',
  manifest: '/manifest.json',
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TubanHub',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: APP_URL,
    siteName: 'TubanHub',
    title: 'TubanHub — Semua tentang Tuban, dalam satu genggaman',
    description:
      'Platform informasi terpadu untuk warga dan wisatawan Tuban, Jawa Timur.',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'TubanHub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TubanHub — Semua tentang Tuban, dalam satu genggaman',
    description: 'Platform informasi terpadu untuk warga dan wisatawan Tuban.',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={cn(GeistSans.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <meta name="application-name" content="TubanHub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TubanHub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="flex min-h-dvh flex-col bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  );
}
