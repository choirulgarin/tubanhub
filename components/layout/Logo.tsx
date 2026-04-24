import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Logo TubanHub — icon pin + wordmark dua warna.
// variant 'default' (full color) untuk background terang, 'white' untuk gelap.
type LogoProps = {
  variant?: 'default' | 'white';
  href?: string | null;
  className?: string;
};

export function Logo({ variant = 'default', href = '/', className }: LogoProps) {
  const isWhite = variant === 'white';

  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <MapPin
        aria-hidden
        className={cn('h-6 w-6', isWhite ? 'text-white' : 'text-primary')}
      />
      <span className="text-lg font-bold leading-none tracking-tight">
        <span className={isWhite ? 'text-white' : 'text-primary'}>Tuban</span>
        <span className={isWhite ? 'text-secondary-light' : 'text-secondary'}>
          Hub
        </span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="TubanHub — beranda" className="shrink-0">
      {content}
    </Link>
  );
}
