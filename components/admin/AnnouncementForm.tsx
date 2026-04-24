'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection } from '@/components/admin/FormSection';
import type { Announcement, AnnouncementCategory } from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: Announcement | null;
};

type FormState = {
  title: string;
  content: string;
  source: string;
  source_url: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string;
  expires_at: string;
};

const CATEGORY_OPTIONS: Array<{ value: AnnouncementCategory; label: string }> = [
  { value: 'umum', label: 'Umum' },
  { value: 'bencana', label: 'Bencana' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'infrastruktur', label: 'Infrastruktur' },
  { value: 'event', label: 'Event' },
];

// Konversi ISO → format <input type="datetime-local"> (YYYY-MM-DDTHH:mm).
function toLocalDatetimeInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function AnnouncementForm({ mode, initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    title: initial?.title ?? '',
    content: initial?.content ?? '',
    source: initial?.source ?? '',
    source_url: initial?.source_url ?? '',
    category: initial?.category ?? 'umum',
    is_pinned: initial?.is_pinned ?? false,
    is_published: initial?.is_published ?? false,
    published_at: toLocalDatetimeInput(initial?.published_at ?? null),
    expires_at: toLocalDatetimeInput(initial?.expires_at ?? null),
  });
  const [saving, setSaving] = useState<null | 'draft' | 'publish'>(null);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function submit(publish: boolean) {
    setError(null);
    if (!state.title.trim()) {
      setError('Judul wajib diisi.');
      return;
    }
    setSaving(publish ? 'publish' : 'draft');

    const payload = {
      title: state.title.trim(),
      content: state.content.trim() || null,
      source: state.source.trim() || null,
      source_url: state.source_url.trim() || null,
      category: state.category,
      is_pinned: state.is_pinned,
      is_published: publish,
      published_at: fromLocalDatetimeInput(state.published_at),
      expires_at: fromLocalDatetimeInput(state.expires_at),
    };

    const endpoint =
      mode === 'create'
        ? '/api/announcements'
        : `/api/announcements/${initial!.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; id?: string; error?: string }
        | null;

      if (!res.ok || !body?.ok) {
        setError(body?.error ?? 'Gagal menyimpan pengumuman.');
        setSaving(null);
        return;
      }

      toast.success(
        publish
          ? 'Pengumuman dipublikasikan.'
          : mode === 'create'
            ? 'Draft pengumuman tersimpan.'
            : 'Perubahan tersimpan.',
      );
      router.push('/admin/announcements');
      router.refresh();
    } catch (err) {
      console.error('[AnnouncementForm]', err);
      setError('Tidak bisa menghubungi server.');
      setSaving(null);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(state.is_published);
      }}
      className="space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Informasi Pengumuman">
        <div className="space-y-1.5">
          <Label htmlFor="ann-title">
            Judul <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ann-title"
            value={state.title}
            onChange={(e) => patch('title', e.target.value)}
            placeholder="Contoh: Imbauan waspada banjir di Kecamatan Palang"
            maxLength={200}
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ann-category">Kategori</Label>
            <Select
              value={state.category}
              onValueChange={(v) =>
                v && patch('category', v as AnnouncementCategory)
              }
            >
              <SelectTrigger id="ann-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ann-source">Sumber (opsional)</Label>
            <Input
              id="ann-source"
              value={state.source}
              onChange={(e) => patch('source', e.target.value)}
              placeholder="BPBD Tuban, Diskominfo, dll."
              maxLength={120}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ann-source-url">URL Sumber (opsional)</Label>
          <Input
            id="ann-source-url"
            type="url"
            value={state.source_url}
            onChange={(e) => patch('source_url', e.target.value)}
            placeholder="https://..."
            maxLength={500}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ann-content">Isi (Markdown)</Label>
          <Textarea
            id="ann-content"
            value={state.content}
            onChange={(e) => patch('content', e.target.value)}
            rows={10}
            placeholder={`## Ringkasan\n\nIsi detail pengumuman...\n\n**Penting:** gunakan format markdown untuk daftar, tebal, dsb.`}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Mendukung markdown: **tebal**, *italic*, # heading, - list, tabel.
          </p>
        </div>
      </FormSection>

      <FormSection title="Penjadwalan & Prioritas">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ann-published-at">
              Tanggal publikasi (opsional)
            </Label>
            <Input
              id="ann-published-at"
              type="datetime-local"
              value={state.published_at}
              onChange={(e) => patch('published_at', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan untuk otomatis = waktu publish.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ann-expires-at">
              Kadaluarsa (opsional)
            </Label>
            <Input
              id="ann-expires-at"
              type="datetime-local"
              value={state.expires_at}
              onChange={(e) => patch('expires_at', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Setelah tanggal ini, pengumuman otomatis tidak tampil.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Pin sebagai banner utama
            </p>
            <p className="text-xs text-muted-foreground">
              Pengumuman yang di-pin muncul sebagai banner di halaman utama.
            </p>
          </div>
          <Switch
            checked={state.is_pinned}
            onCheckedChange={(v) => patch('is_pinned', v)}
            aria-label="Pin pengumuman"
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving !== null}>
          <Link href="/admin/announcements">
            <X className="h-4 w-4" aria-hidden />
            Batal
          </Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => submit(false)}
          disabled={saving !== null}
        >
          {saving === 'draft' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Simpan Draft
        </Button>
        <Button
          type="button"
          onClick={() => submit(true)}
          disabled={saving !== null}
        >
          {saving === 'publish' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {state.is_published ? 'Update & Publish' : 'Publish Sekarang'}
        </Button>
      </div>
    </form>
  );
}
