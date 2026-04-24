'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ad } from '@/types';

type Props = {
  ad: Ad;
  variant?: 'banner' | 'card';
  className?: string;
};

// Kirim track event dengan navigator.sendBeacon (lebih reliable saat navigasi).
// Fallback ke fetch keepalive kalau beacon tidak tersedia.
function track(adId: string, metric: 'impression' | 'click') {
  const payload = JSON.stringify({ metric });
  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(`/api/ads/${adId}/track`, blob);
      return;
    }
  } catch {
    /* no-op */
  }
  fetch(`/api/ads/${adId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function AdCard({ ad, variant = 'card', className }: Props) {
  const ref = useRef<HTMLAnchorElement | HTMLDivElement | null>(null);
  const seenRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seenRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !seenRef.current) {
            seenRef.current = true;
            track(ad.id, 'impression');
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [ad.id]);

  function onClick() {
    track(ad.id, 'click');
  }

  const content = (
    <div
      className={cn(
        'flex gap-3',
        variant === 'banner' ? 'items-center p-4 md:p-5' : 'flex-col p-4',
      )}
    >
      {ad.image_url && (
        <div
          className={cn(
            'relative shrink-0 overflow-hidden rounded-md bg-muted',
            variant === 'banner'
              ? 'h-16 w-16 md:h-20 md:w-20'
              : 'h-32 w-full',
          )}
        >
          <Image
            src={ad.image_url}
            alt=""
            fill
            sizes={variant === 'banner' ? '80px' : '400px'}
            className="object-cover"
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Iklan
          </span>
          {ad.advertiser_name && (
            <span className="truncate text-xs text-muted-foreground">
              · {ad.advertiser_name}
            </span>
          )}
        </div>
        <h3
          className={cn(
            'mt-1 font-medium text-foreground',
            variant === 'banner' ? 'text-sm md:text-base' : 'text-base',
          )}
        >
          {ad.title}
        </h3>
        {ad.description && (
          <p
            className={cn(
              'text-muted-foreground',
              variant === 'banner'
                ? 'mt-0.5 line-clamp-1 text-xs md:text-sm'
                : 'mt-1 line-clamp-2 text-sm',
            )}
          >
            {ad.description}
          </p>
        )}
      </div>

      {ad.link_url && variant === 'banner' && (
        <span
          className="shrink-0 text-xs font-medium text-primary"
          aria-hidden
        >
          Kunjungi →
        </span>
      )}
    </div>
  );

  const wrapperClass = cn(
    'block rounded-xl border border-border bg-card transition-colors hover:bg-muted/30',
    className,
  );

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        onClick={onClick}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={wrapperClass}
        aria-label={`Iklan: ${ad.title}`}
      >
        {content}
        <span className="sr-only">
          <ExternalLink className="h-3 w-3" aria-hidden />
          Buka di tab baru
        </span>
      </a>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={wrapperClass}
      role="complementary"
      aria-label="Iklan"
    >
      {content}
    </div>
  );
}
