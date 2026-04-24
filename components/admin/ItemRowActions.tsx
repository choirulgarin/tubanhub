'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ItemRowActionsProps = {
  id: string;
  title: string;
  isPublished: boolean;
};

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
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/items/${id}/edit`} aria-label={`Edit ${title}`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={togglePublish}
        disabled={busy !== null || pending}
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
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setConfirming(true)}
        disabled={busy !== null || pending}
        className="text-destructive hover:text-destructive"
        aria-label={`Hapus ${title}`}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Hapus
      </Button>

      {error && (
        <span className="w-full text-right text-xs text-destructive" role="alert">
          {error}
        </span>
      )}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus item ini?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan.{' '}
              <span className="font-medium text-foreground">{title}</span>{' '}
              akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={busy !== null}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={busy !== null}
            >
              {busy === 'delete' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
