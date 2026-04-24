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
import type { Ad } from '@/types';

export function AdRowActions({ ad }: { ad: Ad }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | 'toggle' | 'delete'>(null);
  const [confirming, setConfirming] = useState(false);

  async function toggleActive() {
    setBusy('toggle');
    try {
      const res = await fetch(`/api/ads/${ad.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: ad.title,
          description: ad.description,
          image_url: ad.image_url,
          link_url: ad.link_url,
          advertiser_name: ad.advertiser_name,
          advertiser_contact: ad.advertiser_contact,
          placement: ad.placement,
          category_slug: ad.category_slug,
          starts_at: ad.starts_at,
          ends_at: ad.ends_at,
          is_active: !ad.is_active,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal mengubah status.');
        return;
      }
      toast.success(ad.is_active ? 'Iklan di-pause.' : 'Iklan diaktifkan.');
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
      const res = await fetch(`/api/ads/${ad.id}`, { method: 'DELETE' });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal menghapus.');
        return;
      }
      toast.success('Iklan dihapus.');
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
        <Link href={`/admin/ads/${ad.id}/edit`}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          Edit
        </Link>
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={toggleActive}
        disabled={busy !== null || pending}
      >
        {busy === 'toggle' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : ad.is_active ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
        {ad.is_active ? 'Pause' : 'Aktifkan'}
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
            <DialogTitle>Hapus iklan?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{ad.title}</span>{' '}
              akan dihapus permanen beserta seluruh statistiknya.
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
