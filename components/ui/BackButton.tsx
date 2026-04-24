'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type BackButtonProps = {
  /** Fallback path jika tidak ada history (misal: dibuka via link langsung). */
  fallbackHref?: string;
  label?: string;
  className?: string;
};

// Tombol "Kembali" — mencoba router.back(), fallback ke href beranda jika history kosong.
export function BackButton({
  fallbackHref = '/',
  label = 'Kembali',
  className,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    // `window.history.length` minimal 1 di SPA — pakai referrer sebagai heuristik
    // untuk mendeteksi apakah user masuk langsung dari luar.
    if (typeof window !== 'undefined') {
      if (window.history.length > 1 && document.referrer) {
        router.back();
        return;
      }
    }
    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-primary',
        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
