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

const CATEGORIES = [
  { value: ALL, label: 'Semua kategori' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'seni-budaya', label: 'Seni & Budaya' },
  { value: 'bisnis-umkm', label: 'Bisnis & UMKM' },
  { value: 'sosial-lingkungan', label: 'Sosial & Lingkungan' },
  { value: 'teknologi-kreatif', label: 'Teknologi & Kreatif' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'hobi', label: 'Hobi' },
  { value: 'keagamaan', label: 'Keagamaan' },
];

const SORTS = [
  { value: 'popular', label: 'Terpopuler' },
  { value: 'members', label: 'Anggota terbanyak' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'az', label: 'A–Z' },
];

type Props = {
  category: string;
  open: string;
  sort: string;
  className?: string;
};

export function CommunityFilterBar({ category, open, sort, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL || value === '') next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `/komunitas?${qs}` : '/komunitas', { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-2 md:grid-cols-3',
        className,
      )}
      data-pending={isPending ? '' : undefined}
    >
      <Select
        value={category || ALL}
        onValueChange={(v) => update('category', v)}
      >
        <SelectTrigger aria-label="Filter kategori">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={open === '1' ? '1' : ALL}
        onValueChange={(v) => update('open', v === '1' ? '1' : null)}
      >
        <SelectTrigger aria-label="Status keanggotaan">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua status</SelectItem>
          <SelectItem value="1">Terbuka</SelectItem>
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
