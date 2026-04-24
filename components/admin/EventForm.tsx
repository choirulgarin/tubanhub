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
import { TagInput } from '@/components/admin/TagInput';
import type { EventItem, EventCategory } from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: EventItem | null;
  communities: Array<{ id: string; name: string }>;
};

const NONE = '__none__';

type FormState = {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  content: string;
  category: EventCategory;
  cover_url: string;
  community_id: string;
  organizer_name: string;
  organizer_contact: string;
  start_date: string;
  end_date: string;
  location_name: string;
  location_address: string;
  district: string;
  gmaps_url: string;
  is_online: boolean;
  online_url: string;
  ticket_price: string;
  ticket_note: string;
  registration_url: string;
  registration_deadline: string;
  max_attendees: string;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
};

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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export function EventForm({ mode, initial, communities }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    content: initial?.content ?? '',
    category: initial?.category ?? 'umum',
    cover_url: initial?.cover_url ?? '',
    community_id: initial?.community_id ?? '',
    organizer_name: initial?.organizer_name ?? '',
    organizer_contact: initial?.organizer_contact ?? '',
    start_date: toLocalDatetimeInput(initial?.start_date ?? null),
    end_date: toLocalDatetimeInput(initial?.end_date ?? null),
    location_name: initial?.location_name ?? '',
    location_address: initial?.location_address ?? '',
    district: initial?.district ?? '',
    gmaps_url: initial?.gmaps_url ?? '',
    is_online: initial?.is_online ?? false,
    online_url: initial?.online_url ?? '',
    ticket_price:
      initial?.ticket_price != null ? String(initial.ticket_price) : '0',
    ticket_note: initial?.ticket_note ?? '',
    registration_url: initial?.registration_url ?? '',
    registration_deadline: toLocalDatetimeInput(
      initial?.registration_deadline ?? null,
    ),
    max_attendees:
      initial?.max_attendees != null ? String(initial.max_attendees) : '',
    tags: initial?.tags ?? [],
    is_featured: initial?.is_featured ?? false,
    is_published: initial?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!state.title.trim()) {
      setError('Judul wajib diisi.');
      return;
    }
    if (!state.start_date) {
      setError('Tanggal mulai wajib diisi.');
      return;
    }
    const slug = state.slug.trim() || slugify(state.title);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug tidak valid.');
      return;
    }
    setSaving(true);

    const payload = {
      ...state,
      slug,
      community_id: state.community_id || null,
      start_date: fromLocalDatetimeInput(state.start_date),
      end_date: fromLocalDatetimeInput(state.end_date),
      registration_deadline: fromLocalDatetimeInput(state.registration_deadline),
      ticket_price: state.ticket_price ? parseInt(state.ticket_price, 10) : 0,
      max_attendees: state.max_attendees
        ? parseInt(state.max_attendees, 10)
        : null,
    };

    const endpoint =
      mode === 'create' ? '/api/events' : `/api/events/${initial!.id}`;
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
        setError(body?.error ?? 'Gagal menyimpan event.');
        setSaving(false);
        return;
      }

      toast.success(
        mode === 'create' ? 'Event berhasil dibuat.' : 'Perubahan tersimpan.',
      );
      router.push('/admin/events');
      router.refresh();
    } catch (err) {
      console.error('[EventForm]', err);
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

      <FormSection title="Identitas">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="e-title"
              value={state.title}
              onChange={(e) => {
                const title = e.target.value;
                patch('title', title);
                if (mode === 'create' && !state.slug) patch('slug', slugify(title));
              }}
              maxLength={200}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-slug">Slug</Label>
            <Input
              id="e-slug"
              value={state.slug}
              onChange={(e) => patch('slug', e.target.value)}
              placeholder="auto-generated"
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e-tagline">Tagline</Label>
          <Input
            id="e-tagline"
            value={state.tagline}
            onChange={(e) => patch('tagline', e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e-desc">Deskripsi singkat</Label>
          <Textarea
            id="e-desc"
            value={state.description}
            onChange={(e) => patch('description', e.target.value)}
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="e-content">Detail (Markdown)</Label>
          <Textarea
            id="e-content"
            value={state.content}
            onChange={(e) => patch('content', e.target.value)}
            rows={8}
            maxLength={10000}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select
              value={state.category}
              onValueChange={(v) => v && patch('category', v as EventCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umum">Umum</SelectItem>
                <SelectItem value="olahraga">Olahraga</SelectItem>
                <SelectItem value="bisnis">Bisnis</SelectItem>
                <SelectItem value="sosial">Sosial</SelectItem>
                <SelectItem value="seni-budaya">Seni & Budaya</SelectItem>
                <SelectItem value="keagamaan">Keagamaan</SelectItem>
                <SelectItem value="pendidikan">Pendidikan</SelectItem>
                <SelectItem value="teknologi">Teknologi</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-cover">URL cover</Label>
            <Input
              id="e-cover"
              type="url"
              value={state.cover_url}
              onChange={(e) => patch('cover_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Diselenggarakan oleh komunitas</Label>
          <Select
            value={state.community_id || NONE}
            onValueChange={(v) =>
              patch('community_id', v && v !== NONE ? v : '')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih komunitas (opsional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>— Tanpa komunitas —</SelectItem>
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      <FormSection title="Waktu">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-start">
              Mulai <span className="text-destructive">*</span>
            </Label>
            <Input
              id="e-start"
              type="datetime-local"
              value={state.start_date}
              onChange={(e) => patch('start_date', e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-end">Selesai (opsional)</Label>
            <Input
              id="e-end"
              type="datetime-local"
              value={state.end_date}
              onChange={(e) => patch('end_date', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Lokasi">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <span className="text-sm text-foreground">Event online</span>
          <Switch
            checked={state.is_online}
            onCheckedChange={(v) => patch('is_online', v)}
          />
        </div>
        {state.is_online && (
          <div className="space-y-1.5">
            <Label htmlFor="e-online">Link online (Zoom/Meet/...)</Label>
            <Input
              id="e-online"
              type="url"
              value={state.online_url}
              onChange={(e) => patch('online_url', e.target.value)}
            />
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-loc-name">Nama tempat</Label>
            <Input
              id="e-loc-name"
              value={state.location_name}
              onChange={(e) => patch('location_name', e.target.value)}
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-district">Kecamatan</Label>
            <Input
              id="e-district"
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-addr">Alamat lengkap</Label>
          <Textarea
            id="e-addr"
            value={state.location_address}
            onChange={(e) => patch('location_address', e.target.value)}
            rows={2}
            maxLength={400}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-gmaps">Google Maps URL</Label>
          <Input
            id="e-gmaps"
            type="url"
            value={state.gmaps_url}
            onChange={(e) => patch('gmaps_url', e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Penyelenggara">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-org">Nama penyelenggara</Label>
            <Input
              id="e-org"
              value={state.organizer_name}
              onChange={(e) => patch('organizer_name', e.target.value)}
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-org-contact">Kontak (WA / URL)</Label>
            <Input
              id="e-org-contact"
              value={state.organizer_contact}
              onChange={(e) => patch('organizer_contact', e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Tiket & Pendaftaran">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-price">Harga tiket (Rp, 0 = gratis)</Label>
            <Input
              id="e-price"
              type="number"
              min={0}
              value={state.ticket_price}
              onChange={(e) => patch('ticket_price', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-price-note">Catatan harga</Label>
            <Input
              id="e-price-note"
              value={state.ticket_note}
              onChange={(e) => patch('ticket_note', e.target.value)}
              maxLength={200}
              placeholder="Early bird, early HTM, dll."
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="e-reg">URL pendaftaran</Label>
            <Input
              id="e-reg"
              type="url"
              value={state.registration_url}
              onChange={(e) => patch('registration_url', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-reg-deadline">Batas pendaftaran</Label>
            <Input
              id="e-reg-deadline"
              type="datetime-local"
              value={state.registration_deadline}
              onChange={(e) => patch('registration_deadline', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="e-max">Kapasitas maksimum (opsional)</Label>
          <Input
            id="e-max"
            type="number"
            min={0}
            value={state.max_attendees}
            onChange={(e) => patch('max_attendees', e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Tags">
        <TagInput
          value={state.tags}
          onChange={(v) => patch('tags', v)}
          placeholder="gratis, weekend, keluarga…"
          max={15}
        />
      </FormSection>

      <FormSection title="Status">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <span className="text-sm text-foreground">
              Featured (event unggulan)
            </span>
            <Switch
              checked={state.is_featured}
              onCheckedChange={(v) => patch('is_featured', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <span className="text-sm text-foreground">
              Published (tampil publik)
            </span>
            <Switch
              checked={state.is_published}
              onCheckedChange={(v) => patch('is_published', v)}
            />
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/events">
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
          {mode === 'create' ? 'Simpan Event' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
