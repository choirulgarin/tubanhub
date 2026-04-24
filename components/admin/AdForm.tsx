'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
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
import type { Ad, AdPlacement, Category } from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  categories: Category[];
  initial?: Ad | null;
};

type FormState = {
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  advertiser_name: string;
  advertiser_contact: string;
  placement: AdPlacement;
  category_slug: string; // '' = semua kategori
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

const PLACEMENTS: Array<{ value: AdPlacement; label: string; hint: string }> = [
  { value: 'home_top', label: 'Beranda atas', hint: 'Tampil di atas hero' },
  { value: 'home_bottom', label: 'Beranda bawah', hint: 'Di bawah destinasi' },
  { value: 'category_top', label: 'Atas kategori', hint: 'Di atas daftar item' },
  { value: 'sidebar', label: 'Sidebar', hint: 'Slot kecil di sisi' },
];

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

const ALL_CATEGORIES_SENTINEL = '__all__';

export function AdForm({ mode, categories, initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    image_url: initial?.image_url ?? '',
    link_url: initial?.link_url ?? '',
    advertiser_name: initial?.advertiser_name ?? '',
    advertiser_contact: initial?.advertiser_contact ?? '',
    placement: initial?.placement ?? 'home_bottom',
    category_slug: initial?.category_slug ?? '',
    starts_at: toLocalDatetimeInput(initial?.starts_at ?? null),
    ends_at: toLocalDatetimeInput(initial?.ends_at ?? null),
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!state.title.trim()) {
      setError('Judul iklan wajib diisi.');
      return;
    }
    setSaving(true);

    const payload = {
      title: state.title.trim(),
      description: state.description.trim() || null,
      image_url: state.image_url.trim() || null,
      link_url: state.link_url.trim() || null,
      advertiser_name: state.advertiser_name.trim() || null,
      advertiser_contact: state.advertiser_contact.trim() || null,
      placement: state.placement,
      category_slug: state.category_slug || null,
      starts_at: fromLocalDatetimeInput(state.starts_at),
      ends_at: fromLocalDatetimeInput(state.ends_at),
      is_active: state.is_active,
    };

    const endpoint = mode === 'create' ? '/api/ads' : `/api/ads/${initial!.id}`;
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
        setError(body?.error ?? 'Gagal menyimpan iklan.');
        setSaving(false);
        return;
      }

      toast.success(
        mode === 'create' ? 'Iklan berhasil dibuat.' : 'Perubahan tersimpan.',
      );
      router.push('/admin/ads');
      router.refresh();
    } catch (err) {
      console.error('[AdForm]', err);
      setError('Tidak bisa menghubungi server.');
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-6"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Konten Iklan">
        <div className="space-y-1.5">
          <Label htmlFor="ad-title">
            Judul <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ad-title"
            value={state.title}
            onChange={(e) => patch('title', e.target.value)}
            placeholder="Contoh: Kopi Tubanku — Grand Opening"
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ad-description">Deskripsi</Label>
          <Textarea
            id="ad-description"
            value={state.description}
            onChange={(e) => patch('description', e.target.value)}
            rows={3}
            maxLength={400}
            placeholder="Teaser singkat yang muncul di bawah judul."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-image">URL gambar</Label>
            <Input
              id="ad-image"
              type="url"
              value={state.image_url}
              onChange={(e) => patch('image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-link">URL tujuan klik</Label>
            <Input
              id="ad-link"
              type="url"
              value={state.link_url}
              onChange={(e) => patch('link_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-adv-name">Nama pengiklan</Label>
            <Input
              id="ad-adv-name"
              value={state.advertiser_name}
              onChange={(e) => patch('advertiser_name', e.target.value)}
              maxLength={120}
              placeholder="Nama toko/UMKM"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-adv-contact">Kontak pengiklan</Label>
            <Input
              id="ad-adv-contact"
              value={state.advertiser_contact}
              onChange={(e) => patch('advertiser_contact', e.target.value)}
              maxLength={120}
              placeholder="WA / email (internal only)"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Penempatan & Targeting">
        <div className="space-y-1.5">
          <Label>Placement</Label>
          <Select
            value={state.placement}
            onValueChange={(v) => v && patch('placement', v as AdPlacement)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLACEMENTS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label} — {p.hint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Kategori target</Label>
          <Select
            value={state.category_slug || ALL_CATEGORIES_SENTINEL}
            onValueChange={(v) =>
              patch(
                'category_slug',
                v === null || v === ALL_CATEGORIES_SENTINEL ? '' : v,
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_SENTINEL}>
                Semua kategori
              </SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Khusus placement &ldquo;Atas kategori&rdquo; — iklan ini muncul di
            halaman kategori yang dipilih.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ad-starts">Mulai tayang (opsional)</Label>
            <Input
              id="ad-starts"
              type="datetime-local"
              value={state.starts_at}
              onChange={(e) => patch('starts_at', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ad-ends">Berakhir (opsional)</Label>
            <Input
              id="ad-ends"
              type="datetime-local"
              value={state.ends_at}
              onChange={(e) => patch('ends_at', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Iklan aktif
            </p>
            <p className="text-xs text-muted-foreground">
              Non-aktifkan untuk pause tanpa menghapus.
            </p>
          </div>
          <Switch
            checked={state.is_active}
            onCheckedChange={(v) => patch('is_active', v)}
            aria-label="Iklan aktif"
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/ads">
            <X className="h-4 w-4" aria-hidden />
            Batal
          </Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          {mode === 'create' ? 'Simpan Iklan' : 'Update Iklan'}
        </Button>
      </div>
    </form>
  );
}
