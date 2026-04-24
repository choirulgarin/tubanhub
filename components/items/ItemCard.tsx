import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Ticket, CheckCircle } from 'lucide-react';
import type { ItemWithCategory } from '@/types';
import { cn } from '@/lib/utils';

type ItemCardProps = {
  item: ItemWithCategory;
  variant?: 'default' | 'wisata' | 'compact';
  className?: string;
};

// Ekstrak value dari metadata secara aman — metadata bebas-bentuk (jsonb).
function getMetaString(meta: Record<string, unknown>, key: string): string | null {
  const v = meta?.[key];
  return typeof v === 'string' && v.length > 0 ? v : null;
}

export function ItemCard({ item, variant = 'default', className }: ItemCardProps) {
  const color = item.category?.color ?? '#2563EB';
  const categoryName = item.category?.name ?? null;
  const href = item.category?.slug
    ? `/${item.category.slug}/${item.slug}`
    : `/item/${item.slug}`;

  const estimasi = getMetaString(item.metadata, 'estimasi_waktu');
  const hargaTiket = getMetaString(item.metadata, 'harga_tiket');

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-card card-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className,
      )}
    >
      {/* Bar warna kategori di atas */}
      <span
        aria-hidden
        className="h-1 w-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Thumbnail / placeholder untuk varian wisata */}
      {variant === 'wisata' && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {item.thumbnail_url ? (
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-full w-full items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${color}33 0%, ${color}14 100%)`,
              }}
            >
              <MapPin className="h-12 w-12" style={{ color }} strokeWidth={1.5} />
            </div>
          )}

          {hargaTiket && (
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow">
              <Ticket className="h-3.5 w-3.5 text-accent" aria-hidden />
              {hargaTiket}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* Badge subcategory / kategori */}
        {(item.subcategory || categoryName) && (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              {item.subcategory ?? categoryName}
            </span>
            {item.is_verified && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
                <CheckCircle className="h-3 w-3" aria-hidden />
                Terverifikasi
              </span>
            )}
          </div>
        )}

        <h3 className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2 group-hover:text-primary">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-sm leading-relaxed text-slate-500 line-clamp-3">
            {item.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 text-xs text-slate-500">
          {item.district && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {item.district}
            </span>
          )}
          {estimasi && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {estimasi}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
