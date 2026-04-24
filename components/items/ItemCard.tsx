import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, CheckCircle, Star, Pin } from 'lucide-react';
import type { HighlightTier, ItemWithCategory } from '@/types';
import { cn } from '@/lib/utils';

type ItemCardProps = {
  item: ItemWithCategory;
  variant?: 'default' | 'wisata' | 'compact';
  className?: string;
};

function getMetaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta?.[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function tierStyles(tier: HighlightTier | undefined) {
  if (tier === 'featured') {
    return {
      wrap: 'border-amber-300 bg-amber-50/40 hover:bg-amber-50',
      badge: 'bg-amber-100 text-amber-800',
      label: 'Featured',
      Icon: Star,
      pin: true,
    };
  }
  if (tier === 'highlight') {
    return {
      wrap: 'border-blue-200 bg-blue-50/30 hover:bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
      label: 'Unggulan',
      Icon: Star,
      pin: false,
    };
  }
  return null;
}

// ItemCard — clean & minimalis: border + hover tint, tanpa shadow.
// Seluruh card sebagai link tunggal untuk accessibility & tap target.
export function ItemCard({ item, variant = 'default', className }: ItemCardProps) {
  const categoryName = item.category?.name ?? null;
  const href = item.category?.slug
    ? `/${item.category.slug}/${item.slug}`
    : `/item/${item.slug}`;

  const estimasi = getMetaString(item.metadata, 'estimasi_waktu');
  const tier = tierStyles(item.highlight_tier);

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-colors',
        tier ? tier.wrap : 'border-border hover:bg-muted/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    >
      {tier && (
        <span
          className={cn(
            'absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            tier.badge,
          )}
        >
          <tier.Icon className="h-3 w-3" aria-hidden />
          {tier.label}
        </span>
      )}
      {tier?.pin && (
        <Pin
          className="absolute right-3 top-3 z-10 h-4 w-4 text-amber-500"
          aria-hidden
        />
      )}

      {/* Thumbnail hanya untuk varian wisata */}
      {variant === 'wisata' && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {item.thumbnail_url ? (
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <MapPin className="h-8 w-8" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 p-4">
        {/* Badge subcategory / kategori */}
        {(item.subcategory || categoryName) && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {item.subcategory ?? categoryName}
            </span>
            {item.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" aria-hidden />
                Terverifikasi
              </span>
            )}
          </div>
        )}

        <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {item.title}
        </h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {item.district && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {item.district}
            </span>
          )}
          {estimasi && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {estimasi}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
