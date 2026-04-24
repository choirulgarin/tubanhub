import { SkeletonCard } from '@/components/ui/SkeletonCard';

// Skeleton halaman /wisata — varian card dengan gambar.
export default function WisataLoading() {
  return (
    <>
      <section className="bg-gradient-to-br from-secondary/10 via-white to-secondary/5">
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
                className="h-8 w-28 animate-pulse rounded-full bg-slate-200"
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} variant="wisata" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
