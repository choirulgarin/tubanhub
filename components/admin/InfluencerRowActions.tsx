'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Influencer } from '@/types';

export function InfluencerRowActions({ influencer }: { influencer: Influencer }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | 'toggle' | 'delete'>(null);
  const [confirming, setConfirming] = useState(false);

  async function togglePublished() {
    setBusy('toggle');
    try {
      const res = await fetch(`/api/influencers/${influencer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...influencer,
          rate_min: influencer.rate_min,
          rate_max: influencer.rate_max,
          is_published: !influencer.is_published,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal mengubah status.');
        return;
      }
      toast.success(
        influencer.is_published ? 'Tidak dipublikasi.' : 'Dipublikasi.',
      );
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      toast.error('Tidak bisa menghubungi server.');
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setBusy('delete');
    try {
      const res = await fetch(`/api/influencers/${influencer.id}`, {
        method: 'DELETE',
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal menghapus.');
        return;
      }
      toast.success('Influencer dihapus.');
      setConfirming(false);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
      toast.error('Tidak bisa menghubungi server.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button asChild size="sm" variant="outline">
        <Link href={`/admin/influencers/${influencer.id}/edit`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={togglePublished}
        disabled={busy !== null || pending}
      >
        {busy === 'toggle' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : influencer.is_published ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
        {influencer.is_published ? 'Unpublish' : 'Publish'}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setConfirming(true)}
        disabled={busy !== null || pending}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        Hapus
      </Button>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus influencer?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{influencer.name}</span>{' '}
              akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirming(false)}
              disabled={busy !== null}
            >
              Batal
            </Button>
            <Button
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
