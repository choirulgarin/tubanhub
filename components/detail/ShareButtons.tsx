'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Lucide v1.9 menghapus icon brand (Facebook, Instagram, dsb) — pakai inline SVG.
function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.7v8h3.5Z" />
    </svg>
  );
}

type ShareButtonsProps = {
  title: string;
};

// Kumpulan tombol share: native (Web Share API), copy link, WhatsApp, Facebook.
export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleNative() {
    if (typeof navigator === 'undefined') return;
    const url = window.location.href;
    // navigator.share hanya tersedia di browser modern (mostly mobile).
    if ('share' in navigator) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancel → abaikan.
      }
    } else {
      await handleCopy();
    }
  }

  async function handleCopy() {
    if (typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent.
    }
  }

  function currentUrl() {
    return typeof window !== 'undefined' ? window.location.href : '';
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleNative}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-dark',
        )}
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Bagikan
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary"
        aria-label="Salin tautan"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-secondary" aria-hidden />
            Tersalin
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Salin tautan
          </>
        )}
      </button>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${currentUrl()}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-secondary hover:text-secondary"
      >
        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
        WhatsApp
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:border-primary hover:text-primary"
      >
        <IconFacebook className="h-3.5 w-3.5" />
        Facebook
      </a>
    </div>
  );
}
