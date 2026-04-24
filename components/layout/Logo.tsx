import Link from 'next/link';
import { cn } from '@/lib/utils';

// Logo TubanHub — wordmark dua warna tanpa icon (clean & minimalis).
// variant 'default' untuk background terang, 'white' untuk background gelap.
type LogoProps = {
  variant?: 'default' | 'white';
  href?: string | null;
  className?: string;
};

export function Logo({ variant = 'default', href = '/', className }: LogoProps) {
  const isWhite = variant === 'white';

  const content = (
    <span
      className={cn(
        'inline-flex items-center text-base font-semibold leading-none tracking-tight',
        className,
      )}
    >
      <span className={isWhite ? 'text-white' : 'text-foreground'}>Tuban</span>
      <span className={isWhite ? 'text-white/80' : 'text-primary'}>Hub</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="TubanHub — beranda" className="shrink-0">
      {content}
    </Link>
  );
}
