import { Logo } from '@/components/layout/Logo';

// Root loading UI — ditampilkan otomatis oleh Next ketika segment sedang di-load.
export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="animate-pulse">
        <Logo href={null} />
      </div>
      <span className="text-sm text-slate-500">Memuat…</span>
    </div>
  );
}
