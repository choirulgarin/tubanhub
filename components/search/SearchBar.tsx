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
        'group relative flex w-full items-center rounded-full bg-white shadow-card ring-1 ring-slate-200 transition focus-within:ring-2 focus-within:ring-primary',
        className,
      )}
    >
      <Search
        aria-hidden
        className="pointer-events-none ml-4 h-5 w-5 shrink-0 text-slate-400 group-focus-within:text-primary"
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
        className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none md:text-base"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Bersihkan pencarian"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
      <button
        type="submit"
        className="mr-1.5 hidden h-9 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark md:inline-flex"
      >
        Cari
      </button>
    </form>
  );
}
