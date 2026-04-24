'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';

type ItemRowActionsProps = {
  id: string;
  title: string;
  isPublished: boolean;
};

// Aksi per-baris di tabel item admin: edit, toggle publish, delete (dengan konfirmasi).
export function ItemRowActions({ id, title, isPublished }: ItemRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | 'toggle' | 'delete'>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function togglePublish() {
    setBusy('toggle');
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !isPublished }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Gagal memperbarui status.');
      }
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setBusy('delete');
    setError(null);
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Gagal menghapus.');
      }
      setConfirming(false);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Link
        href={`/admin/items/${id}/edit`}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
        aria-label={`Edit ${title}`}
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden />
        Edit
      </Link>

      <button
        type="button"
        onClick={togglePublish}
        disabled={busy !== null || pending}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-secondary hover:text-secondary disabled:opacity-50"
        aria-label={isPublished ? 'Unpublish' : 'Publish'}
      >
        {busy === 'toggle' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : isPublished ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
        {isPublished ? 'Unpublish' : 'Publish'}
      </button>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={busy !== null || pending}
        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        aria-label={`Hapus ${title}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Hapus
      </button>

      {error && (
        <span className="w-full text-right text-xs text-red-600" role="alert">
          {error}
        </span>
      )}

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirming(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Hapus item ini?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Tindakan ini tidak dapat dibatalkan.{' '}
              <span className="font-medium">{title}</span> akan dihapus permanen.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={busy !== null}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy === 'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
