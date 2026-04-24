'use client';

import { useState } from 'react';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  slug: string;
};

export function ShareCard({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== 'undefined'
      ? `${window.location.origin}/event/${slug}`
      : `/event/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* no-op */
    }
  }

  const waText = encodeURIComponent(`${title}\n${url}`);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Share2 className="h-4 w-4" aria-hidden />
        Bagikan Event
      </h3>
      <div className="mt-3 flex flex-col gap-2">
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              Tersalin
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden />
              Salin Link
            </>
          )}
        </Button>
        <Button asChild variant="outline">
          <a
            href={`https://wa.me/?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageSquare className="h-4 w-4" aria-hidden />
            Bagikan ke WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
