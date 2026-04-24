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

export type SortValue = 'newest' | 'popular' | 'az';

type FilterBarProps = {
  basePath: string;
  subcategories: string[];
  activeSub?: string;
  activeSort?: SortValue;
  ariaLabel?: string;
  className?: string;
};

const SORT_OPTIONS: Array<{ value: SortValue; label: string }> = [
  { value: 'az', label: 'A-Z' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'popular', label: 'Terpopuler' },
];

/**
 * Kombinasi filter subcategory (tabs) + sorting (select) berbasis URL.
 * Semua perubahan meng-update searchParams via router.replace — tanpa reload.
 */
export function FilterBar({
  basePath,
  subcategories,
  activeSub,
  activeSort = 'az',
  ariaLabel = 'Filter',
  className,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function navigate(next: URLSearchParams) {
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    });
  }

  function handleSubClick(value: string | undefined) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set('sub', value);
    else next.delete('sub');
    navigate(next);
  }

  function handleSortChange(value: SortValue) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === 'az') next.delete('sort');
    else next.set('sort', value);
    navigate(next);
  }

  const tabs: Array<{ label: string; value?: string }> = [
    { label: 'Semua' },
    ...subcategories.map((s) => ({ label: s, value: s })),
  ];

  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
      data-pending={isPending ? '' : undefined}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 md:mx-0 md:min-w-0 md:flex-1 md:px-0"
      >
        {tabs.map((tab) => {
          const isActive =
            (tab.value ?? undefined) === activeSub ||
            (!tab.value && !activeSub);
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSubClick(tab.value)}
              className={cn(
                'relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 md:shrink-0">
        <span className="text-xs text-muted-foreground">Urutkan</span>
        <Select
          value={activeSort}
          onValueChange={(v) => v && handleSortChange(v as SortValue)}
        >
          <SelectTrigger className="w-[140px]" aria-label="Urutkan hasil">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
