import Link from 'next/link';
import Image from 'next/image';
import { MapPin, BadgeCheck, Sparkles, Zap, HandCoins } from 'lucide-react';
import type { Influencer } from '@/types';
import { cn } from '@/lib/utils';
import { PlatformIcon, formatFollowers, formatRupiahShort } from './PlatformIcon';

type Props = {
  influencer: Influencer;
  className?: string;
};

export function InfluencerCard({ influencer, className }: Props) {
  const tier = influencer.highlight_tier;
  const niches = influencer.niches.slice(0, 3);

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card p-5 transition-colors',
        tier === 'featured' &&
          'border-amber-300 bg-amber-50/40 dark:bg-amber-950/10',
        tier === 'highlight' &&
          'border-blue-200 bg-blue-50/30 dark:bg-blue-950/10',
        (tier === 'none' || tier === 'basic') && 'border-border hover:bg-muted/40',
        className,
      )}
    >
      {/* Badge tier */}
      {tier === 'featured' && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-medium text-white">
          <Sparkles className="h-3 w-3" aria-hidden />
          Featured
        </span>
      )}
      {tier === 'highlight' && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
          Unggulan
        </span>
      )}

      <div className="flex items-start gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
          {influencer.photo_url ? (
            <Image
              src={influencer.photo_url}
              alt={influencer.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-muted-foreground">
              {influencer.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {influencer.name}
          </h3>

          <div className="mt-1 flex flex-wrap items-center gap-1">
            {influencer.is_verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <BadgeCheck className="h-2.5 w-2.5" aria-hidden />
                Verified
              </span>
            )}
            {influencer.is_claimed && (
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                Klaim
              </span>
            )}
            {influencer.is_umkm_friendly && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                <HandCoins className="h-2.5 w-2.5" aria-hidden />
                UMKM
              </span>
            )}
            {influencer.is_fast_response && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Zap className="h-2.5 w-2.5" aria-hidden />
                Fast
              </span>
            )}
          </div>
        </div>
      </div>

      {niches.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {niches.map((n) => (
            <span
              key={n}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium capitalize text-secondary-foreground"
            >
              {n}
            </span>
          ))}
        </div>
      )}

      {influencer.platforms.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {influencer.platforms.slice(0, 3).map((p) => (
            <li key={p.platform + p.username} className="inline-flex items-center gap-1">
              <PlatformIcon platform={p.platform} className="h-3.5 w-3.5" />
              <span>{formatFollowers(p.followers)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {influencer.rate_min && influencer.rate_max
              ? `${formatRupiahShort(influencer.rate_min)} – ${formatRupiahShort(influencer.rate_max)}`
              : 'Hubungi untuk harga'}
          </p>
          {influencer.district && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden />
              {influencer.district}
            </p>
          )}
        </div>
      </div>

      <Link
        href={`/influencer/${influencer.slug}`}
        className="mt-3 inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Lihat Profil
      </Link>
    </article>
  );
}
