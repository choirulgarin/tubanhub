import { SkeletonCard } from '@/components/ui/SkeletonCard';

// Skeleton halaman /birokrasi — dipasang otomatis oleh Next saat segment loading.
export default function BirokrasiLoading() {
  return (
    <>
      {/* PageHeader skeleton */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5">
        <div className="container-app py-10 md:py-14">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-8 w-56 animate-pulse rounded bg-slate-200 md:h-10 md:w-72" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
        </div>
      </section>

      <section className="section">
        <div className="container-app space-y-6">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 animate-pulse rounded-full bg-slate-200"
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
