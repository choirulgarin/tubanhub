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
   * Warna hex kategori (contoh: "#2563EB"). Dipakai untuk tint gradient dan icon.
   * Kalau tidak diisi, default ke biru primary.
   */
  color?: string;
  breadcrumb?: Breadcrumb[];
  className?: string;
};

// Header halaman yang konsisten untuk kategori & halaman utama.
// Gradient halus berdasarkan `color`, breadcrumb di atas, icon besar di kanan (desktop only).
export function PageHeader({
  title,
  description,
  icon: Icon,
  color = '#2563EB',
  breadcrumb,
  className,
}: PageHeaderProps) {
  // Gradient halus: warna kategori + background netral.
  // `inline style` dipakai di sini karena warna datang dari data dinamis
  // (per-kategori), bukan token Tailwind statis.
  const gradientStyle = {
    backgroundImage: `linear-gradient(135deg, ${color}14 0%, ${color}05 60%, transparent 100%)`,
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-slate-200 bg-white',
        className,
      )}
      style={gradientStyle}
    >
      <div className="container-app relative py-8 md:py-12">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
              {breadcrumb.map((item, idx) => {
                const isLast = idx === breadcrumb.length - 1;
                return (
                  <li key={idx} className="inline-flex items-center gap-1">
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="hover:text-primary hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? 'page' : undefined}
                        className={cn(isLast && 'font-medium text-slate-700')}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast && (
                      <ChevronRight className="h-3 w-3" aria-hidden />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 max-w-3xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                {description}
              </p>
            )}
          </div>

          {Icon && (
            <div
              aria-hidden
              className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl md:flex"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              <Icon className="h-8 w-8" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
