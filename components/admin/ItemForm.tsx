'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Save, Send, X } from 'lucide-react';
import type { Category, Item, ItemMetadata, OpeningHours } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection } from '@/components/admin/FormSection';
import { TagInput } from '@/components/admin/TagInput';
import { ImagePreview } from '@/components/admin/ImagePreview';
import { OpeningHoursInput } from '@/components/admin/OpeningHoursInput';
import { MetadataFields } from '@/components/admin/MetadataFields';
import { generateSlug } from '@/lib/utils/slug';

type Mode = 'create' | 'edit';

type ItemFormProps = {
  mode: Mode;
  categories: Category[];
  initial?: Item | null;
  appUrl?: string;
};

type FormState = {
  category_id: string;
  subcategory: string;
  title: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  content: string;
  tags: string[];
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  district: string;
  gmaps_url: string;
  lat: string;
  lng: string;
  opening_hours: OpeningHours;
  thumbnail_url: string;
  images: string[];
  metadata: ItemMetadata;
  is_published: boolean;
  is_verified: boolean;
};

function initialState(item: Item | null | undefined): FormState {
  return {
    category_id: item?.category_id ?? '',
    subcategory: item?.subcategory ?? '',
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    slugTouched: !!item?.slug,
    description: item?.description ?? '',
    content: item?.content ?? '',
    tags: item?.tags ?? [],
    phone: item?.phone ?? '',
    whatsapp: item?.whatsapp ?? '',
    email: item?.email ?? '',
    website: item?.website ?? '',
    address: item?.address ?? '',
    district: item?.district ?? '',
    gmaps_url: item?.gmaps_url ?? '',
    lat: item?.lat != null ? String(item.lat) : '',
    lng: item?.lng != null ? String(item.lng) : '',
    opening_hours: (item?.opening_hours ?? {}) as OpeningHours,
    thumbnail_url: item?.thumbnail_url ?? '',
    images: item?.images ?? [],
    metadata: (item?.metadata ?? {}) as ItemMetadata,
    is_published: item?.is_published ?? false,
    is_verified: item?.is_verified ?? false,
  };
}

export function ItemForm({
  mode,
  categories,
  initial,
  appUrl,
}: ItemFormProps) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialState(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<null | 'draft' | 'publish' | 'update'>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const activeCategory = useMemo(
    () => categories.find((c) => c.id === state.category_id) ?? null,
    [categories, state.category_id],
  );

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function handleTitleChange(title: string) {
    setState((s) => ({
      ...s,
      title,
      slug: s.slugTouched ? s.slug : generateSlug(title),
    }));
  }

  function handleSlugChange(slug: string) {
    setState((s) => ({ ...s, slug, slugTouched: true }));
  }

  function validate(): string | null {
    if (!state.category_id) return 'Kategori wajib dipilih.';
    if (!state.title.trim()) return 'Judul wajib diisi.';
    if (!state.slug.trim()) return 'Slug wajib diisi.';
    if (!/^[a-z0-9-]+$/.test(state.slug))
      return 'Slug hanya boleh huruf kecil, angka, dan tanda strip.';
    if (state.description.length > 300)
      return 'Deskripsi maksimum 300 karakter.';
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email))
      return 'Format email tidak valid.';
    if (state.website && !/^https?:\/\//.test(state.website))
      return 'Website harus diawali http:// atau https://';
    const latNum = state.lat ? Number(state.lat) : null;
    const lngNum = state.lng ? Number(state.lng) : null;
    if (latNum != null && (isNaN(latNum) || latNum < -90 || latNum > 90))
      return 'Latitude harus antara -90 hingga 90.';
    if (lngNum != null && (isNaN(lngNum) || lngNum < -180 || lngNum > 180))
      return 'Longitude harus antara -180 hingga 180.';
    return null;
  }

  function toPayload(publishOverride?: boolean) {
    return {
      category_id: state.category_id,
      subcategory: state.subcategory.trim() || null,
      title: state.title.trim(),
      slug: state.slug.trim(),
      description: state.description.trim() || null,
      content: state.content.trim() || null,
      tags: state.tags,
      phone: state.phone.trim() || null,
      whatsapp: state.whatsapp.trim() || null,
      email: state.email.trim() || null,
      website: state.website.trim() || null,
      address: state.address.trim() || null,
      district: state.district.trim() || null,
      gmaps_url: state.gmaps_url.trim() || null,
      lat: state.lat ? Number(state.lat) : null,
      lng: state.lng ? Number(state.lng) : null,
      opening_hours: state.opening_hours,
      thumbnail_url: state.thumbnail_url.trim() || null,
      images: state.images,
      metadata: state.metadata,
      is_published: publishOverride ?? state.is_published,
      is_verified: state.is_verified,
    };
  }

  async function handleSubmit(intent: 'draft' | 'publish' | 'update') {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setSaving(intent);
    try {
      let publishOverride: boolean | undefined;
      if (intent === 'draft') publishOverride = false;
      if (intent === 'publish') publishOverride = true;
      const payload = toPayload(publishOverride);

      const url =
        mode === 'create' ? '/api/items' : `/api/items/${initial?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Gagal menyimpan.' }));
        throw new Error(j.error ?? 'Gagal menyimpan.');
      }

      const successMsg =
        intent === 'publish'
          ? 'Item berhasil dipublikasikan.'
          : intent === 'update'
            ? 'Perubahan berhasil disimpan.'
            : 'Draft berhasil disimpan.';
      toast.success(successMsg);
      router.push('/admin/items');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan.';
      setError(msg);
      toast.error(msg);
      setSaving(null);
    }
  }

  async function handleDelete() {
    if (!initial?.id) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${initial.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Gagal menghapus.' }));
        throw new Error(j.error ?? 'Gagal menghapus.');
      }
      toast.success('Item berhasil dihapus.');
      router.push('/admin/items');
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Terjadi kesalahan.';
      setError(msg);
      toast.error(msg);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  const slugPreview =
    appUrl && activeCategory?.slug && state.slug
      ? `${appUrl.replace(/\/$/, '')}/${activeCategory.slug}/${state.slug}`
      : null;

  return (
    <div className="space-y-6 pb-28">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Informasi Utama">
        <TwoCol>
          <Field id="category" label="Kategori" required>
            <Select
              value={state.category_id}
              onValueChange={(v) => patch('category_id', v ?? '')}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="subcategory" label="Subcategory">
            <Input
              id="subcategory"
              value={state.subcategory}
              onChange={(e) => patch('subcategory', e.target.value)}
              placeholder="Contoh: KTP, Wisata Alam…"
            />
          </Field>
        </TwoCol>

        <Field id="title" label="Judul" required>
          <Input
            id="title"
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nama layanan / destinasi"
          />
        </Field>

        <Field
          id="slug"
          label="Slug"
          required
          help="Otomatis diisi dari judul — edit jika perlu."
        >
          <Input
            id="slug"
            value={state.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="slug-url-friendly"
          />
          {slugPreview && (
            <p className="mt-1.5 truncate text-xs text-muted-foreground">
              URL: <span className="font-mono">{slugPreview}</span>
            </p>
          )}
        </Field>

        <Field
          id="description"
          label="Deskripsi"
          help={`${state.description.length} / 300 karakter`}
        >
          <Textarea
            id="description"
            rows={3}
            maxLength={300}
            value={state.description}
            onChange={(e) => patch('description', e.target.value)}
            placeholder="Deskripsi singkat untuk card & hasil pencarian."
          />
        </Field>

        <Field id="content" label="Konten / Panduan">
          <Textarea
            id="content"
            rows={10}
            value={state.content}
            onChange={(e) => patch('content', e.target.value)}
            placeholder="Penjelasan lengkap — minimal 10 baris. Dukung line-break biasa."
          />
        </Field>

        <Field id="tags" label="Tags" help="Ketik tag lalu tekan Enter.">
          <TagInput
            value={state.tags}
            onChange={(t) => patch('tags', t)}
            placeholder="tuban, wisata-alam, kuliner…"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Kontak"
        description="Kosongkan field yang tidak berlaku."
      >
        <TwoCol>
          <Field id="phone" label="Telepon">
            <Input
              id="phone"
              type="tel"
              value={state.phone}
              onChange={(e) => patch('phone', e.target.value)}
              placeholder="+62…"
            />
          </Field>
          <Field id="whatsapp" label="WhatsApp">
            <Input
              id="whatsapp"
              type="tel"
              value={state.whatsapp}
              onChange={(e) => patch('whatsapp', e.target.value)}
              placeholder="+62…"
            />
          </Field>
          <Field id="email" label="Email">
            <Input
              id="email"
              type="email"
              value={state.email}
              onChange={(e) => patch('email', e.target.value)}
              placeholder="nama@contoh.com"
            />
          </Field>
          <Field id="website" label="Website">
            <Input
              id="website"
              type="url"
              value={state.website}
              onChange={(e) => patch('website', e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </TwoCol>
      </FormSection>

      <FormSection title="Lokasi">
        <Field id="address" label="Alamat">
          <Textarea
            id="address"
            rows={2}
            value={state.address}
            onChange={(e) => patch('address', e.target.value)}
            placeholder="Jalan, nomor, RT/RW, kelurahan…"
          />
        </Field>
        <TwoCol>
          <Field id="district" label="Kecamatan">
            <Input
              id="district"
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
            />
          </Field>
          <Field id="gmaps_url" label="Google Maps URL">
            <Input
              id="gmaps_url"
              type="url"
              value={state.gmaps_url}
              onChange={(e) => patch('gmaps_url', e.target.value)}
              placeholder="https://maps.google.com/…"
            />
          </Field>
        </TwoCol>
        <TwoCol>
          <Field id="lat" label="Latitude">
            <Input
              id="lat"
              type="number"
              step="any"
              value={state.lat}
              onChange={(e) => patch('lat', e.target.value)}
              placeholder="-6.8970"
            />
          </Field>
          <Field id="lng" label="Longitude">
            <Input
              id="lng"
              type="number"
              step="any"
              value={state.lng}
              onChange={(e) => patch('lng', e.target.value)}
              placeholder="111.9125"
            />
          </Field>
        </TwoCol>
      </FormSection>

      <FormSection
        title="Jam Operasional"
        description="Aktifkan hari yang relevan. Pilih '24 jam' atau atur rentang jam."
      >
        <OpeningHoursInput
          value={state.opening_hours}
          onChange={(v) => patch('opening_hours', v)}
        />
      </FormSection>

      <FormSection title="Media">
        <Field id="thumbnail_url" label="Thumbnail URL">
          <Input
            id="thumbnail_url"
            type="url"
            value={state.thumbnail_url}
            onChange={(e) => patch('thumbnail_url', e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <ImagePreview src={state.thumbnail_url} alt="Preview thumbnail" />

        <Field id="images" label="Gambar Tambahan">
          <ImageListInput
            value={state.images}
            onChange={(imgs) => patch('images', imgs)}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Metadata Khusus Kategori"
        description="Field otomatis menyesuaikan kategori yang dipilih."
      >
        <MetadataFields
          categorySlug={activeCategory?.slug ?? null}
          value={state.metadata}
          onChange={(m) => patch('metadata', m)}
        />
      </FormSection>

      <FormSection title="Pengaturan">
        <SwitchRow
          label="Publikasikan item ini"
          description="Saat aktif, item akan muncul di website publik."
          checked={state.is_published}
          onChange={(v) => patch('is_published', v)}
        />
        <SwitchRow
          label="Tandai sebagai terverifikasi"
          description="Tampilkan badge 'Terverifikasi' pada card & halaman detail."
          checked={state.is_verified}
          onChange={(v) => patch('is_verified', v)}
        />
      </FormSection>

      {mode === 'edit' && (
        <div className="rounded-xl border border-destructive/30 bg-card p-5">
          <h3 className="text-sm font-medium text-destructive">
            Zona Berbahaya
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Menghapus item akan menghilangkannya secara permanen dari sistem.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-3 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Hapus Item
          </Button>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:left-[220px]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/items">Batal</Link>
          </Button>
          {mode === 'create' ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={saving !== null}
                onClick={() => handleSubmit('draft')}
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
                size="sm"
                disabled={saving !== null}
                onClick={() => handleSubmit('publish')}
              >
                {saving === 'publish' ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
                Simpan & Publikasikan
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={saving !== null}
              onClick={() => handleSubmit('update')}
            >
              {saving === 'update' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              Simpan Perubahan
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus item ini?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan.{' '}
              <span className="font-medium text-foreground">
                {initial?.title}
              </span>{' '}
              akan dihapus permanen dari database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
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

function Field({
  id,
  label,
  required,
  help,
  children,
}: {
  id?: string;
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ImageListInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  function updateAt(idx: number, v: string) {
    const next = value.slice();
    next[idx] = v;
    onChange(next);
  }
  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }
  function add() {
    onChange([...value, '']);
  }

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Belum ada gambar tambahan. Klik{' '}
          <span className="font-medium text-foreground">Tambah URL</span> untuk
          menambah.
        </p>
      )}
      {value.map((url, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <Input
              type="url"
              value={url}
              onChange={(e) => updateAt(idx, e.target.value)}
              placeholder="https://…"
            />
            {url && <ImagePreview src={url} ratio="16/9" />}
          </div>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => removeAt(idx)}
            aria-label="Hapus URL"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add}>
        <Plus className="h-4 w-4" aria-hidden />
        Tambah URL
      </Button>
    </div>
  );
}
