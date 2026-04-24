import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Video, Ticket } from 'lucide-react';
import type { EventWithCommunity } from '@/types';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

type Props = {
  event: EventWithCommunity;
  className?: string;
  size?: 'md' | 'lg';
};

const CATEGORY_LABEL: Record<string, string> = {
  umum: 'Umum',
  olahraga: 'Olahraga',
  bisnis: 'Bisnis',
  sosial: 'Sosial',
  'seni-budaya': 'Seni & Budaya',
  keagamaan: 'Keagamaan',
  pendidikan: 'Pendidikan',
  teknologi: 'Teknologi',
};

const CATEGORY_GRADIENT: Record<string, string> = {
  umum: 'from-slate-400 to-slate-600',
  olahraga: 'from-emerald-500 to-teal-700',
  bisnis: 'from-amber-500 to-orange-600',
  sosial: 'from-rose-500 to-pink-700',
  'seni-budaya': 'from-violet-500 to-fuchsia-700',
  keagamaan: 'from-sky-500 to-indigo-700',
  pendidikan: 'from-blue-500 to-cyan-700',
  teknologi: 'from-neutral-700 to-neutral-900',
};

export function EventCard({ event, className, size = 'md' }: Props) {
  const gradient =
    CATEGORY_GRADIENT[event.category] ?? CATEGORY_GRADIENT.umum;
  const isFree = event.ticket_price === 0;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20',
        className,
      )}
    >
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden',
          size === 'lg' && 'aspect-[16/10]',
        )}
      >
        {event.cover_url ? (
          <Image
            src={event.cover_url}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className={cn(
              'flex h-full w-full items-center justify-center bg-gradient-to-br text-white',
              gradient,
            )}
          >
            <CalendarDays
              className={cn(size === 'lg' ? 'h-12 w-12' : 'h-8 w-8')}
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
            {CATEGORY_LABEL[event.category] ?? event.category}
          </span>
          {event.is_online && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground backdrop-blur">
              <Video className="h-2.5 w-2.5" aria-hidden />
              Online
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur',
              isFree
                ? 'bg-green-600 text-white'
                : 'bg-background/90 text-foreground',
            )}
          >
            <Ticket className="h-2.5 w-2.5" aria-hidden />
            {isFree ? 'GRATIS' : formatCurrency(event.ticket_price)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3
          className={cn(
            'line-clamp-2 font-semibold text-foreground',
            size === 'lg' ? 'text-base' : 'text-sm',
          )}
        >
          {event.title}
        </h3>

        <dl className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>{formatDateTime(event.start_date)}</span>
          </div>
          {event.location_name && (
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{event.location_name}</span>
            </div>
          )}
        </dl>

        {event.organizer_name && (
          <p className="mt-2 truncate text-xs text-muted-foreground">
            oleh{' '}
            <span className="font-medium text-foreground">
              {event.organizer_name}
            </span>
          </p>
        )}

        <Link
          href={`/event/${event.slug}`}
          className="mt-auto pt-3"
          aria-label={`Lihat detail ${event.title}`}
        >
          <span className="inline-flex w-full items-center justify-center rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
            Lihat Detail
          </span>
        </Link>
      </div>
    </article>
  );
}
