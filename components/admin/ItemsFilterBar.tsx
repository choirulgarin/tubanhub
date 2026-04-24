'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/types';

type ItemsFilterBarProps = {
  categories: Category[];
};

const ALL = '__all__';

export function ItemsFilterBar({ categories }: ItemsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const initialMount = useRef(true);

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (q.trim()) next.set('q', q.trim());
      else next.delete('q');
      next.delete('page');
      router.replace(`/admin/items?${next.toString()}`);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function handleSelect(key: 'category' | 'status', value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    router.replace(`/admin/items?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul item…"
          aria-label="Cari judul item"
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get('category') ?? ALL}
        onValueChange={(v) => handleSelect('category', v)}
      >
        <SelectTrigger className="md:w-[180px]" aria-label="Filter kategori">
          <SelectValue placeholder="Semua Kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua Kategori</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get('status') ?? ALL}
        onValueChange={(v) => handleSelect('status', v)}
      >
        <SelectTrigger className="md:w-[150px]" aria-label="Filter status">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Semua Status</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
