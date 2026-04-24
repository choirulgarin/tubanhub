'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Check, X, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils/format';
import type { Suggestion, SuggestionStatus } from '@/types';

type Props = {
  suggestion: Suggestion;
};

export function SuggestionActions({ suggestion }: Props) {
  const router = useRouter();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [notes, setNotes] = useState(suggestion.notes ?? '');
  const [pending, setPending] = useState<null | SuggestionStatus>(null);

  async function updateStatus(
    status: SuggestionStatus,
    extras: { notes?: string | null } = {},
  ) {
    setPending(status);
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: extras.notes ?? null }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; itemId?: string | null; error?: string }
        | null;

      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal memperbarui usulan.');
        return;
      }

      if (status === 'approved') {
        if (body.itemId) {
          toast.success('Disetujui — draft item dibuat.', {
            action: {
              label: 'Edit draft',
              onClick: () => router.push(`/admin/items/${body.itemId}/edit`),
            },
          });
        } else {
          toast.success('Usulan disetujui.');
        }
      } else if (status === 'rejected') {
        toast.success('Usulan ditolak.');
      } else {
        toast.success('Status diubah ke pending.');
      }

      setReviewOpen(false);
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      console.error('[SuggestionActions]', err);
      toast.error('Tidak bisa menghubungi server.');
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setReviewOpen(true)}
          aria-label={`Review usulan ${suggestion.name}`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Review
        </Button>
        {suggestion.status !== 'approved' && (
          <Button
            size="sm"
            onClick={() => updateStatus('approved')}
            disabled={pending !== null}
          >
            {pending === 'approved' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Check className="h-3.5 w-3.5" aria-hidden />
            )}
            Approve
          </Button>
        )}
        {suggestion.status !== 'rejected' && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setNotes(suggestion.notes ?? '');
              setRejectOpen(true);
            }}
            disabled={pending !== null}
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Reject
          </Button>
        )}
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Usulan</DialogTitle>
            <DialogDescription>
              Ditandai <StatusLabel status={suggestion.status} /> pada{' '}
              {formatDateTime(suggestion.created_at)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <Row label="Nama tempat" value={suggestion.name} bold />
            <Row label="Kategori" value={suggestion.category ?? '—'} />
            <Row label="Alamat" value={suggestion.address ?? '—'} />
            <Row
              label="Deskripsi"
              value={suggestion.description ?? '—'}
              multiline
            />
            <Row label="Kontak tempat" value={suggestion.contact ?? '—'} />
            <Row
              label="Pengusul"
              value={
                [suggestion.submitted_by, suggestion.submitted_contact]
                  .filter(Boolean)
                  .join(' — ') || '—'
              }
            />
            {suggestion.notes && (
              <Row label="Catatan admin" value={suggestion.notes} multiline />
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {suggestion.status !== 'approved' && (
              <Button
                onClick={() => updateStatus('approved')}
                disabled={pending !== null}
              >
                {pending === 'approved' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Check className="h-4 w-4" aria-hidden />
                )}
                Approve & buat draft
              </Button>
            )}
            {suggestion.status !== 'rejected' && (
              <Button
                variant="destructive"
                onClick={() => {
                  setNotes(suggestion.notes ?? '');
                  setReviewOpen(false);
                  setRejectOpen(true);
                }}
                disabled={pending !== null}
              >
                <X className="h-4 w-4" aria-hidden />
                Reject
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setReviewOpen(false)}
              disabled={pending !== null}
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Usulan</DialogTitle>
            <DialogDescription>
              Isi alasan penolakan. Catatan ini akan disimpan untuk referensi
              internal.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reject-notes">Alasan</Label>
            <Textarea
              id="reject-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: data tidak cukup untuk verifikasi."
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(false)}
              disabled={pending !== null}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatus('rejected', { notes: notes.trim() || null })}
              disabled={pending !== null}
            >
              {pending === 'rejected' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <X className="h-4 w-4" aria-hidden />
              )}
              Tolak Usulan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({
  label,
  value,
  multiline,
  bold,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={
          multiline
            ? 'whitespace-pre-wrap text-foreground'
            : bold
            ? 'font-medium text-foreground'
            : 'text-foreground'
        }
      >
        {value}
      </span>
    </div>
  );
}

function StatusLabel({ status }: { status: SuggestionStatus }) {
  if (status === 'approved') return <Badge variant="secondary">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="outline">Rejected</Badge>;
  return <Badge>Pending</Badge>;
}

export function SuggestionItemLink({ itemId }: { itemId: string }) {
  return (
    <Button asChild size="sm" variant="outline">
      <a href={`/admin/items/${itemId}/edit`}>
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        Lihat draft
      </a>
    </Button>
  );
}
