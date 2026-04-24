import { cn } from '@/lib/utils';

type SkeletonCardProps = {
  variant?: 'default' | 'wisata';
  className?: string;
};

// Skeleton loader untuk ItemCard. Dimensinya disamakan agar tidak ada layout shift
// ketika data selesai di-load dan ItemCard asli di-render.
export function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-card',
        className,
      )}
      aria-hidden
    >
      {/* bar warna atas (mirip ItemCard) */}
      <div className="h-1 w-full bg-slate-200 animate-pulse" />

      {variant === 'wisata' && (
        <div className="aspect-[16/9] w-full bg-slate-200 animate-pulse" />
      )}

      <div className="space-y-3 p-6">
        <div className="h-5 w-24 rounded-full bg-slate-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-4/5 rounded bg-slate-200 animate-pulse" />
          <div className="h-5 w-3/5 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-11/12 rounded bg-slate-100 animate-pulse" />
          <div className="h-3 w-9/12 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-16 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
