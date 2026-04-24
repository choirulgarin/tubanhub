import { getActiveAds } from '@/lib/queries';
import { AdCard } from '@/components/ads/AdCard';
import { cn } from '@/lib/utils';
import type { AdPlacement } from '@/types';

type Props = {
  placement: AdPlacement;
  categorySlug?: string;
  limit?: number;
  variant?: 'banner' | 'card';
  className?: string;
};

// Server component: fetch iklan aktif untuk placement + kategori,
// render pakai <AdCard>. Kalau tidak ada iklan, tidak render apa-apa.
export async function AdSlot({
  placement,
  categorySlug,
  limit = 1,
  variant = 'banner',
  className,
}: Props) {
  const ads = await getActiveAds(placement, categorySlug, limit);
  if (ads.length === 0) return null;

  return (
    <div
      className={cn(
        variant === 'card'
          ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col gap-3',
        className,
      )}
    >
      {ads.map((ad) => (
        <AdCard key={ad.id} ad={ad} variant={variant} />
      ))}
    </div>
  );
}
