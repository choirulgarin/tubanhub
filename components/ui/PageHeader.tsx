import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Breadcrumb = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /**
   * Warna hex kategori (contoh: "#2563EB"). Dipakai hanya untuk tint
   * icon kecil di kiri judul. Tanpa gradient mencolok.
   */
  color?: string;
  breadcrumb?: Breadcrumb[];
  className?: string;
};

// Header halaman minimalis: breadcrumb + icon kecil + judul + deskripsi.
// Background netral (bg-muted/20) dengan border bawah — tanpa gradient.
export function PageHeader({
  title,
  description,
  icon: Icon,
  color = '#2563EB',
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn('border-b border-border bg-muted/20', className)}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <li key={idx} className="inline-flex items-center gap-1">
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={cn(isLast && 'text-foreground')}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast && <ChevronRight className="h-3 w-3" aria-hidden />}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="flex items-start gap-3">
          {Icon && (
            <div
              aria-hidden
              className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
