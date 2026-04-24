import { cn } from '@/lib/utils';

type SkeletonCardProps = {
  variant?: 'default' | 'wisata';
  className?: string;
};

export function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
      aria-hidden
    >
      {variant === 'wisata' && (
        <div className="aspect-[16/9] w-full animate-pulse bg-muted" />
      )}

      <div className="space-y-3 p-4">
        <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted/60" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
