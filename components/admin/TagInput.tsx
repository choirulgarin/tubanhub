'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  /** Karakter pemisah selain Enter — default [',', 'Tab']. */
  separators?: string[];
  /** Maksimum jumlah tag. Jika terlampaui, input di-disable. */
  max?: number;
  className?: string;
  id?: string;
};

// Input chips: user ketik lalu Enter/koma untuk menambah tag.
// Dipakai untuk field tags, syarat, fasilitas, menu_andalan, tips, dsb.
export function TagInput({
  value,
  onChange,
  placeholder = 'Ketik lalu tekan Enter…',
  separators = [',', 'Tab'],
  max,
  className,
  id,
}: TagInputProps) {
  const [draft, setDraft] = useState('');

  const atMax = max != null && value.length >= max;

  function commit(raw: string) {
    const t = raw.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft('');
      return;
    }
    if (atMax) return;
    onChange([...value, t]);
    setDraft('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (separators.includes(e.key)) {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleBlur() {
    if (draft.trim()) commit(draft);
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div
      className={cn(
        'flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30',
        className,
      )}
      onClick={(e) => {
        // Klik di area kosong → focus input.
        const input = (e.currentTarget.querySelector('input') as HTMLInputElement | null);
        input?.focus();
      }}
    >
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeAt(idx)}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
            aria-label={`Hapus tag ${tag}`}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={atMax ? 'Maksimum tercapai' : placeholder}
        disabled={atMax}
        className="flex-1 min-w-[120px] bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
