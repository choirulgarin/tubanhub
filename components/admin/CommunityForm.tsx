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
import type { Community, CommunityCategory, HighlightTier } from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: Community | null;
};

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: CommunityCategory;
  logo_url: string;
  cover_url: string;
  website: string;
  contact_wa: string;
  contact_email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp_group: string;
  telegram_group: string;
  area: string;
  district: string;
  meeting_place: string;
  meeting_schedule: string;
  member_count: string;
  founded_year: string;
  is_verified: boolean;
  is_claimed: boolean;
  is_open: boolean;
  tags: string[];
  highlight_tier: HighlightTier;
  highlight_expires_at: string;
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
    .slice(0, 80);
}

export function CommunityForm({ mode, initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    tagline: initial?.tagline ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'umum',
    logo_url: initial?.logo_url ?? '',
    cover_url: initial?.cover_url ?? '',
    website: initial?.website ?? '',
    contact_wa: initial?.contact_wa ?? '',
    contact_email: initial?.contact_email ?? '',
    instagram: initial?.instagram ?? '',
    facebook: initial?.facebook ?? '',
    tiktok: initial?.tiktok ?? '',
    youtube: initial?.youtube ?? '',
    whatsapp_group: initial?.whatsapp_group ?? '',
    telegram_group: initial?.telegram_group ?? '',
    area: initial?.area ?? '',
    district: initial?.district ?? '',
    meeting_place: initial?.meeting_place ?? '',
    meeting_schedule: initial?.meeting_schedule ?? '',
    member_count: initial?.member_count ? String(initial.member_count) : '',
    founded_year: initial?.founded_year ? String(initial.founded_year) : '',
    is_verified: initial?.is_verified ?? false,
    is_claimed: initial?.is_claimed ?? false,
    is_open: initial?.is_open ?? true,
    tags: initial?.tags ?? [],
    highlight_tier: initial?.highlight_tier ?? 'none',
    highlight_expires_at: toLocalDatetimeInput(
      initial?.highlight_expires_at ?? null,
    ),
    is_published: initial?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!state.name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    const slug = state.slug.trim() || slugify(state.name);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug tidak valid.');
      return;
    }
    setSaving(true);

    const payload = {
      ...state,
      slug,
      member_count: state.member_count ? parseInt(state.member_count, 10) : 0,
      founded_year: state.founded_year
        ? parseInt(state.founded_year, 10)
        : null,
      highlight_expires_at: fromLocalDatetimeInput(state.highlight_expires_at),
    };

    const endpoint =
      mode === 'create' ? '/api/communities' : `/api/communities/${initial!.id}`;
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
        setError(body?.error ?? 'Gagal menyimpan komunitas.');
        setSaving(false);
        return;
      }

      toast.success(
        mode === 'create' ? 'Komunitas berhasil dibuat.' : 'Perubahan tersimpan.',
      );
      router.push('/admin/communities');
      router.refresh();
    } catch (err) {
      console.error('[CommunityForm]', err);
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
            <Label htmlFor="c-name">
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="c-name"
              value={state.name}
              onChange={(e) => {
                const name = e.target.value;
                patch('name', name);
                if (mode === 'create' && !state.slug) patch('slug', slugify(name));
              }}
              maxLength={160}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-slug">Slug</Label>
            <Input
              id="c-slug"
              value={state.slug}
              onChange={(e) => patch('slug', e.target.value)}
              placeholder="auto-generated"
              maxLength={80}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c-tagline">Tagline</Label>
          <Input
            id="c-tagline"
            value={state.tagline}
            onChange={(e) => patch('tagline', e.target.value)}
            maxLength={200}
            placeholder="Ringkasan singkat (1 baris)"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="c-desc">Deskripsi</Label>
          <Textarea
            id="c-desc"
            value={state.description}
            onChange={(e) => patch('description', e.target.value)}
            rows={6}
            maxLength={3000}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Kategori</Label>
            <Select
              value={state.category}
              onValueChange={(v) =>
                v && patch('category', v as CommunityCategory)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umum">Umum</SelectItem>
                <SelectItem value="olahraga">Olahraga</SelectItem>
                <SelectItem value="seni-budaya">Seni & Budaya</SelectItem>
                <SelectItem value="bisnis-umkm">Bisnis & UMKM</SelectItem>
                <SelectItem value="sosial-lingkungan">
                  Sosial & Lingkungan
                </SelectItem>
                <SelectItem value="teknologi-kreatif">
                  Teknologi & Kreatif
                </SelectItem>
                <SelectItem value="pendidikan">Pendidikan</SelectItem>
                <SelectItem value="hobi">Hobi</SelectItem>
                <SelectItem value="keagamaan">Keagamaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-founded">Tahun berdiri</Label>
            <Input
              id="c-founded"
              type="number"
              min={1800}
              max={2100}
              value={state.founded_year}
              onChange={(e) => patch('founded_year', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-logo">URL logo</Label>
            <Input
              id="c-logo"
              type="url"
              value={state.logo_url}
              onChange={(e) => patch('logo_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-cover">URL cover</Label>
            <Input
              id="c-cover"
              type="url"
              value={state.cover_url}
              onChange={(e) => patch('cover_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Lokasi & Pertemuan">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-area">Area</Label>
            <Input
              id="c-area"
              value={state.area}
              onChange={(e) => patch('area', e.target.value)}
              maxLength={120}
              placeholder="Tuban Kota / Se-Kabupaten"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-district">Kecamatan</Label>
            <Input
              id="c-district"
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-place">Tempat kumpul</Label>
            <Input
              id="c-place"
              value={state.meeting_place}
              onChange={(e) => patch('meeting_place', e.target.value)}
              maxLength={300}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-sched">Jadwal kumpul</Label>
            <Input
              id="c-sched"
              value={state.meeting_schedule}
              onChange={(e) => patch('meeting_schedule', e.target.value)}
              maxLength={200}
              placeholder="Minggu pagi 05.30"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-members">Jumlah anggota</Label>
          <Input
            id="c-members"
            type="number"
            min={0}
            value={state.member_count}
            onChange={(e) => patch('member_count', e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Kontak & Sosial Media">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-wa">WhatsApp</Label>
            <Input
              id="c-wa"
              value={state.contact_wa}
              onChange={(e) => patch('contact_wa', e.target.value)}
              placeholder="08xx"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={state.contact_email}
              onChange={(e) => patch('contact_email', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-wagroup">Link Grup WA</Label>
            <Input
              id="c-wagroup"
              type="url"
              value={state.whatsapp_group}
              onChange={(e) => patch('whatsapp_group', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-telegram">Link Grup Telegram</Label>
            <Input
              id="c-telegram"
              type="url"
              value={state.telegram_group}
              onChange={(e) => patch('telegram_group', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-website">Website</Label>
            <Input
              id="c-website"
              type="url"
              value={state.website}
              onChange={(e) => patch('website', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-ig">Instagram</Label>
            <Input
              id="c-ig"
              value={state.instagram}
              onChange={(e) => patch('instagram', e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-tiktok">TikTok</Label>
            <Input
              id="c-tiktok"
              value={state.tiktok}
              onChange={(e) => patch('tiktok', e.target.value)}
              placeholder="@username"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-fb">Facebook (URL)</Label>
            <Input
              id="c-fb"
              type="url"
              value={state.facebook}
              onChange={(e) => patch('facebook', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-yt">YouTube (URL)</Label>
            <Input
              id="c-yt"
              type="url"
              value={state.youtube}
              onChange={(e) => patch('youtube', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Tags">
        <TagInput
          value={state.tags}
          onChange={(v) => patch('tags', v)}
          placeholder="sepeda, gowes, olahraga…"
          max={15}
        />
      </FormSection>

      <FormSection title="Status & Badges">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { key: 'is_verified', label: 'Verified (centang biru)' },
            { key: 'is_claimed', label: 'Claimed by owner' },
            { key: 'is_open', label: 'Terbuka untuk anggota baru' },
            { key: 'is_published', label: 'Published (tampil publik)' },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <span className="text-sm text-foreground">{label}</span>
              <Switch
                checked={state[key as keyof FormState] as boolean}
                onCheckedChange={(v) => patch(key as keyof FormState, v as never)}
              />
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Highlight / Featured">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tier</Label>
            <Select
              value={state.highlight_tier}
              onValueChange={(v) =>
                v && patch('highlight_tier', v as HighlightTier)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="highlight">Highlight</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-expires">Berakhir (opsional)</Label>
            <Input
              id="c-expires"
              type="datetime-local"
              value={state.highlight_expires_at}
              onChange={(e) => patch('highlight_expires_at', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/communities">
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
          {mode === 'create' ? 'Simpan Komunitas' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
