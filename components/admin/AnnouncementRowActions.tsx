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
import type { Announcement } from '@/types';

type Props = {
  announcement: Announcement;
};

export function AnnouncementRowActions({ announcement }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | 'toggle' | 'delete'>(null);
  const [confirming, setConfirming] = useState(false);

  async function togglePublish() {
    setBusy('toggle');
    try {
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcement.title,
          content: announcement.content,
          source: announcement.source,
          source_url: announcement.source_url,
          category: announcement.category,
          is_pinned: announcement.is_pinned,
          is_published: !announcement.is_published,
          published_at: announcement.published_at,
          expires_at: announcement.expires_at,
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
        announcement.is_published ? 'Pengumuman di-unpublish.' : 'Pengumuman dipublish.',
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
      const res = await fetch(`/api/announcements/${announcement.id}`, {
        method: 'DELETE',
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal menghapus.');
        return;
      }
      toast.success('Pengumuman dihapus.');
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
        <Link href={`/admin/announcements/${announcement.id}/edit`}>
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
      >
        {busy === 'toggle' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        ) : announcement.is_published ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
        {announcement.is_published ? 'Unpublish' : 'Publish'}
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
            <DialogTitle>Hapus pengumuman?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">
                {announcement.title}
              </span>{' '}
              akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
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
