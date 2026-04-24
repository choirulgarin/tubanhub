import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

type LoadingSpinnerProps = {
  size?: SpinnerSize;
  fullPage?: boolean;
  label?: string;
  className?: string;
};

// Spinner primary-color. Default inline; kalau `fullPage` → center di viewport.
export function LoadingSpinner({
  size = 'md',
  fullPage = false,
  label = 'Memuat…',
  className,
}: LoadingSpinnerProps) {
  const spinner = (
    <Loader2
      className={cn('animate-spin text-primary', SIZE_MAP[size], className)}
      aria-hidden
    />
  );

  if (fullPage) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3"
      >
        {spinner}
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    );
  }

  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      {spinner}
    </span>
  );
}
