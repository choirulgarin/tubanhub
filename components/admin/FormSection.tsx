import { cn } from '@/lib/utils';

type FormSectionProps = {
  title: string;
  description?: string;
  id?: string;
  className?: string;
  children: React.ReactNode;
};

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
      className={cn('rounded-xl border border-border bg-card p-5', className)}
    >
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
