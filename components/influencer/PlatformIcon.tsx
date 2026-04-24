// Platform badge pakai abbreviasi teks — brand icon (Instagram, YouTube, dll.)
// sengaja tidak disediakan lucide karena trademark. Text-based lebih ringan.

const META: Record<string, { label: string; bg: string; fg: string }> = {
  instagram: { label: 'IG', bg: 'bg-pink-100', fg: 'text-pink-700' },
  tiktok:    { label: 'TT', bg: 'bg-neutral-900', fg: 'text-white' },
  youtube:   { label: 'YT', bg: 'bg-red-100', fg: 'text-red-700' },
  facebook:  { label: 'FB', bg: 'bg-blue-100', fg: 'text-blue-700' },
  twitter:   { label: 'X',  bg: 'bg-neutral-100', fg: 'text-neutral-800' },
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const m = META[platform.toLowerCase()] ?? {
    label: platform.slice(0, 2).toUpperCase(),
    bg: 'bg-muted',
    fg: 'text-muted-foreground',
  };
  return (
    <span
      aria-hidden
      className={
        'inline-flex h-4 w-4 items-center justify-center rounded-sm text-[9px] font-semibold ' +
        m.bg +
        ' ' +
        m.fg +
        (className ? ' ' + className : '')
      }
    >
      {m.label}
    </span>
  );
}

export function formatFollowers(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (n < 1_000_000) return Math.round(n / 1000) + 'K';
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export function formatRupiahShort(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 1000) return `Rp ${n}`;
  if (n < 1_000_000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`;
}
