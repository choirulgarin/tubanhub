'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
  /**
   * Kalau true, setiap perubahan (debounced) akan mem-push URL ke /search?q=...
   * Dipakai di halaman /search agar UX-nya "live".
   * Default false: hanya submit form yang memicu navigasi.
   */
  liveNavigate?: boolean;
  className?: string;
};

// SearchBar dengan debounce 300ms. Tombol clear muncul saat ada teks.
// Submit / debounce keduanya akan navigate ke /search?q=...
export function SearchBar({
  defaultValue = '',
  placeholder = 'Cari layanan, wisata, atau tempat di Tuban…',
  autoFocus = false,
  liveNavigate = false,
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initialMount = useRef(true);

  // Sync kalau defaultValue berubah (mis. user back/forward di /search).
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Debounced navigation — hanya aktif saat liveNavigate=true.
  useEffect(() => {
    if (!liveNavigate) return;
    // Lewati initial mount supaya tidak langsung replace URL saat mounting.
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    const trimmed = value.trim();
    const timer = setTimeout(() => {
      if (trimmed) {
        router.replace(`/search?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.replace('/search');
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, liveNavigate, router]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleClear() {
    setValue('');
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        'group relative flex w-full items-center rounded-full border border-border bg-background transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30',
        className,
      )}
    >
      <Search
        aria-hidden
        className="pointer-events-none ml-4 h-4 w-4 shrink-0 text-muted-foreground"
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Kata kunci pencarian"
        className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Bersihkan pencarian"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
      <button
        type="submit"
        className="mr-1.5 hidden h-8 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 md:inline-flex"
      >
        Cari
      </button>
    </form>
  );
}
