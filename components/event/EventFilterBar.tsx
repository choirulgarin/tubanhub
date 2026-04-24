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
  { value: 'umum', label: 'Umum' },
  { value: 'olahraga', label: 'Olahraga' },
  { value: 'bisnis', label: 'Bisnis' },
  { value: 'sosial', label: 'Sosial' },
  { value: 'seni-budaya', label: 'Seni & Budaya' },
  { value: 'keagamaan', label: 'Keagamaan' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'teknologi', label: 'Teknologi' },
];

const PRICES = [
  { value: ALL, label: 'Semua harga' },
  { value: 'free', label: 'Gratis' },
  { value: 'paid', label: 'Berbayar' },
];

type Props = {
  category: string;
  price: string;
  className?: string;
};

export function EventFilterBar({ category, price, className }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `/event?${qs}` : '/event', { scroll: false });
    });
  }

  return (
    <div
      className={cn('grid grid-cols-2 gap-2', className)}
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

      <Select value={price || ALL} onValueChange={(v) => update('harga', v)}>
        <SelectTrigger aria-label="Filter harga">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRICES.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
