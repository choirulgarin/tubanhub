'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ALL = '__all__';

const NICHES = [
  { value: ALL, label: 'Semua niche' },
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'wisata', label: 'Wisata' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'religi', label: 'Religi' },
  { value: 'umkm', label: 'UMKM' },
  { value: 'outdoor', label: 'Outdoor' },
];

const PLATFORMS = [
  { value: ALL, label: 'Semua platform' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
];

const BUDGETS = [
  { value: ALL, label: 'Semua budget' },
  { value: 'low', label: '< Rp 200rb' },
  { value: 'mid', label: 'Rp 200rb–500rb' },
  { value: 'high', label: '> Rp 500rb' },
];

const SORTS = [
  { value: 'popular', label: 'Terpopuler' },
  { value: 'followers', label: 'Followers terbanyak' },
  { value: 'cheapest', label: 'Harga terendah' },
];

type Props = {
  niche: string;
  platform: string;
  budget: string;
  sort: string;
  className?: string;
};

export function InfluencerFilterBar({ niche, platform, budget, sort, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `/influencer?${qs}` : '/influencer', { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 md:grid-cols-4',
        className,
      )}
      data-pending={isPending ? '' : undefined}
    >
      <Select value={niche || ALL} onValueChange={(v) => update('niche', v)}>
        <SelectTrigger aria-label="Filter niche">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NICHES.map((n) => (
            <SelectItem key={n.value} value={n.value}>
              {n.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={platform || ALL}
        onValueChange={(v) => update('platform', v)}
      >
        <SelectTrigger aria-label="Filter platform">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={budget || ALL} onValueChange={(v) => update('budget', v)}>
        <SelectTrigger aria-label="Filter budget">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BUDGETS.map((b) => (
            <SelectItem key={b.value} value={b.value}>
              {b.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sort || 'popular'} onValueChange={(v) => update('sort', v)}>
        <SelectTrigger aria-label="Urutkan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORTS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
