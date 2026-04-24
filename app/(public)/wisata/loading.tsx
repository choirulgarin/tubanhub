import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function WisataLoading() {
  return (
    <>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-7 w-56 animate-pulse rounded bg-muted md:h-8 md:w-72" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-muted/60" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-28 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} variant="wisata" />
          ))}
        </div>
      </section>
    </>
  );
}
