import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  BadgeCheck,
  Sparkles,
  Users,
  CalendarClock,
  DoorOpen,
  DoorClosed,
} from 'lucide-react';
import type { Community } from '@/types';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils/format';

type Props = {
  community: Community;
  className?: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  olahraga: 'Olahraga',
  'seni-budaya': 'Seni & Budaya',
  'bisnis-umkm': 'Bisnis & UMKM',
  'sosial-lingkungan': 'Sosial & Lingkungan',
  'teknologi-kreatif': 'Teknologi & Kreatif',
  pendidikan: 'Pendidikan',
  hobi: 'Hobi',
  keagamaan: 'Keagamaan',
  umum: 'Umum',
};

export function CommunityCard({ community, className }: Props) {
  const tier = community.highlight_tier;

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
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
          {community.logo_url ? (
            <Image
              src={community.logo_url}
              alt={community.name}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-semibold text-muted-foreground">
              {community.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {community.name}
          </h3>
          {community.tagline && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {community.tagline}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {CATEGORY_LABEL[community.category] ?? community.category}
            </span>
            {community.is_verified && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <BadgeCheck className="h-2.5 w-2.5" aria-hidden />
                Verified
              </span>
            )}
            {community.is_open ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                <DoorOpen className="h-2.5 w-2.5" aria-hidden />
                Terbuka
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                <DoorClosed className="h-2.5 w-2.5" aria-hidden />
                Invite Only
              </span>
            )}
          </div>
        </div>
      </div>

      <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
        {community.member_count > 0 && (
          <div className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" aria-hidden />
            <span>{formatNumber(community.member_count)} anggota</span>
          </div>
        )}
        {(community.area || community.district) && (
          <div className="inline-flex items-center gap-1 pl-3">
            <MapPin className="h-3 w-3" aria-hidden />
            <span className="truncate">
              {community.area || community.district}
            </span>
          </div>
        )}
      </dl>

      {community.meeting_schedule && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarClock className="h-3 w-3" aria-hidden />
          <span className="truncate">{community.meeting_schedule}</span>
        </p>
      )}

      <Link
        href={`/komunitas/${community.slug}`}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Lihat Komunitas
      </Link>
    </article>
  );
}
