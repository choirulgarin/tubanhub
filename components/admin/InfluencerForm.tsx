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
import { PlatformsInput } from '@/components/admin/PlatformsInput';
import type {
  ContentLanguage,
  HighlightTier,
  Influencer,
  InfluencerPlatform,
} from '@/types';

type Mode = 'create' | 'edit';

type Props = {
  mode: Mode;
  initial?: Influencer | null;
};

type FormState = {
  name: string;
  slug: string;
  bio: string;
  photo_url: string;
  location: string;
  district: string;
  platforms: InfluencerPlatform[];
  niches: string[];
  content_language: ContentLanguage;
  rate_min: string;
  rate_max: string;
  rate_notes: string;
  contact_wa: string;
  contact_email: string;
  contact_dm: string;
  is_verified: boolean;
  is_claimed: boolean;
  is_umkm_friendly: boolean;
  is_fast_response: boolean;
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

export function InfluencerForm({ mode, initial }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    bio: initial?.bio ?? '',
    photo_url: initial?.photo_url ?? '',
    location: initial?.location ?? '',
    district: initial?.district ?? '',
    platforms: initial?.platforms ?? [],
    niches: initial?.niches ?? [],
    content_language: initial?.content_language ?? 'indonesia',
    rate_min: initial?.rate_min != null ? String(initial.rate_min) : '',
    rate_max: initial?.rate_max != null ? String(initial.rate_max) : '',
    rate_notes: initial?.rate_notes ?? '',
    contact_wa: initial?.contact_wa ?? '',
    contact_email: initial?.contact_email ?? '',
    contact_dm: initial?.contact_dm ?? '',
    is_verified: initial?.is_verified ?? false,
    is_claimed: initial?.is_claimed ?? false,
    is_umkm_friendly: initial?.is_umkm_friendly ?? false,
    is_fast_response: initial?.is_fast_response ?? false,
    highlight_tier: initial?.highlight_tier ?? 'none',
    highlight_expires_at: toLocalDatetimeInput(initial?.highlight_expires_at ?? null),
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
      rate_min: state.rate_min ? parseInt(state.rate_min, 10) : null,
      rate_max: state.rate_max ? parseInt(state.rate_max, 10) : null,
      highlight_expires_at: fromLocalDatetimeInput(state.highlight_expires_at),
    };

    const endpoint =
      mode === 'create' ? '/api/influencers' : `/api/influencers/${initial!.id}`;
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
        setError(body?.error ?? 'Gagal menyimpan influencer.');
        setSaving(false);
        return;
      }

      toast.success(
        mode === 'create' ? 'Influencer berhasil dibuat.' : 'Perubahan tersimpan.',
      );
      router.push('/admin/influencers');
      router.refresh();
    } catch (err) {
      console.error('[InfluencerForm]', err);
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
            <Label htmlFor="inf-name">
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="inf-name"
              value={state.name}
              onChange={(e) => {
                const name = e.target.value;
                patch('name', name);
                if (mode === 'create' && !state.slug) patch('slug', slugify(name));
              }}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-slug">Slug</Label>
            <Input
              id="inf-slug"
              value={state.slug}
              onChange={(e) => patch('slug', e.target.value)}
              placeholder="auto-generated"
              maxLength={80}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inf-bio">Bio</Label>
          <Textarea
            id="inf-bio"
            value={state.bio}
            onChange={(e) => patch('bio', e.target.value)}
            rows={4}
            maxLength={1500}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inf-photo">URL foto profil</Label>
          <Input
            id="inf-photo"
            type="url"
            value={state.photo_url}
            onChange={(e) => patch('photo_url', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inf-location">Lokasi</Label>
            <Input
              id="inf-location"
              value={state.location}
              onChange={(e) => patch('location', e.target.value)}
              maxLength={120}
              placeholder="Tuban Kota"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-district">Kecamatan</Label>
            <Input
              id="inf-district"
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
              maxLength={120}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Platform & Jangkauan">
        <PlatformsInput
          value={state.platforms}
          onChange={(v) => patch('platforms', v)}
        />
      </FormSection>

      <FormSection title="Niche & Bahasa">
        <div className="space-y-1.5">
          <Label>Niches</Label>
          <TagInput
            value={state.niches}
            onChange={(v) => patch('niches', v)}
            placeholder="kuliner, wisata, lifestyle…"
            max={10}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Bahasa konten</Label>
          <Select
            value={state.content_language}
            onValueChange={(v) => v && patch('content_language', v as ContentLanguage)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indonesia">Bahasa Indonesia</SelectItem>
              <SelectItem value="jawa">Bahasa Jawa</SelectItem>
              <SelectItem value="campur">Campur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FormSection>

      <FormSection title="Rate Card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="inf-rate-min">Rate minimum (Rp)</Label>
            <Input
              id="inf-rate-min"
              type="number"
              min={0}
              value={state.rate_min}
              onChange={(e) => patch('rate_min', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-rate-max">Rate maksimum (Rp)</Label>
            <Input
              id="inf-rate-max"
              type="number"
              min={0}
              value={state.rate_max}
              onChange={(e) => patch('rate_max', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inf-rate-notes">Catatan rate</Label>
          <Textarea
            id="inf-rate-notes"
            value={state.rate_notes}
            onChange={(e) => patch('rate_notes', e.target.value)}
            rows={2}
            maxLength={400}
          />
        </div>
      </FormSection>

      <FormSection title="Kontak">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="inf-wa">WhatsApp</Label>
            <Input
              id="inf-wa"
              value={state.contact_wa}
              onChange={(e) => patch('contact_wa', e.target.value)}
              maxLength={60}
              placeholder="08xx"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-email">Email</Label>
            <Input
              id="inf-email"
              type="email"
              value={state.contact_email}
              onChange={(e) => patch('contact_email', e.target.value)}
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inf-dm">Platform DM</Label>
            <Input
              id="inf-dm"
              value={state.contact_dm}
              onChange={(e) => patch('contact_dm', e.target.value)}
              maxLength={60}
              placeholder="instagram / tiktok"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Badges & Status">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { key: 'is_verified', label: 'Verified (centang biru)' },
            { key: 'is_claimed', label: 'Claimed by owner' },
            { key: 'is_umkm_friendly', label: 'UMKM Friendly' },
            { key: 'is_fast_response', label: 'Fast Response' },
            { key: 'is_published', label: 'Published (tampil publik)' },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <span className="text-sm text-foreground">{label}</span>
              <Switch
                checked={state[key as keyof FormState] as boolean}
                onCheckedChange={(v) =>
                  patch(key as keyof FormState, v as never)
                }
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
              onValueChange={(v) => v && patch('highlight_tier', v as HighlightTier)}
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
            <Label htmlFor="inf-expires">Berakhir (opsional)</Label>
            <Input
              id="inf-expires"
              type="datetime-local"
              value={state.highlight_expires_at}
              onChange={(e) => patch('highlight_expires_at', e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/influencers">
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
          {mode === 'create' ? 'Simpan Influencer' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
