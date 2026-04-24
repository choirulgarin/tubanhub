import { Inbox } from 'lucide-react';
import type { ItemWithCategory } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

type ItemGridProps = {
  items: ItemWithCategory[];
  loading?: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  variant?: 'default' | 'wisata';
  className?: string;
};

// Grid generik untuk daftar item. Handle 3 state: loading, empty, normal.
export function ItemGrid({
  items,
  loading = false,
  skeletonCount = 3,
  emptyMessage = 'Belum ada data yang tersedia.',
  variant = 'default',
  className,
}: ItemGridProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-6 md:grid-cols-3', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SkeletonCard key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Belum ada data"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className={cn('grid gap-6 md:grid-cols-3', className)}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} variant={variant} />
      ))}
    </div>
  );
}
