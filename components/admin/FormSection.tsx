import { cn } from '@/lib/utils';

type FormSectionProps = {
  title: string;
  description?: string;
  /** Nilai hanya dipakai untuk menandai section collapsible — dibiarkan sederhana di sini. */
  id?: string;
  className?: string;
  children: React.ReactNode;
};

// Wrapper konsisten untuk tiap section di form admin.
// Pakai <section> dengan border + padding biar setiap blok berdiri sendiri.
export function FormSection({
  title,
  description,
  id,
  className,
  children,
}: FormSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:p-6',
        className,
      )}
    >
      <header className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-base font-semibold text-slate-900 md:text-lg">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs text-slate-500 md:text-sm">{description}</p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
