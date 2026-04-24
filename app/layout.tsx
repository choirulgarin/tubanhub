import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// URL dasar untuk OG/canonical — fallback ke localhost saat dev.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
    <html lang="id" className={cn('font-sans', inter.variable)}>
      <head>
        {/* Meta tags PWA tambahan yang tidak ter-cover API Metadata */}
        <meta name="application-name" content="TubanHub" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TubanHub" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        <OfflineIndicator />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
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
