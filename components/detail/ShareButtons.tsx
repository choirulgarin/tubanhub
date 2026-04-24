'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShareButtonsProps = {
  title: string;
};

export function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleNative() {
    if (typeof navigator === 'undefined') return;
    const url = window.location.href;
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
      <Button size="sm" onClick={handleNative}>
        <Share2 className="h-3.5 w-3.5" aria-hidden />
        Bagikan
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={handleCopy}
        aria-label="Salin tautan"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            Tersalin
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" aria-hidden />
            Salin tautan
          </>
        )}
      </Button>

      <Button size="sm" variant="outline" asChild>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${currentUrl()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
