'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Trash2,
  Save,
  Send,
  X,
  AlertCircle,
} from 'lucide-react';
import type { Category, Item, ItemMetadata, OpeningHours } from '@/types';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';
import { TagInput } from '@/components/admin/TagInput';
import { ImagePreview } from '@/components/admin/ImagePreview';
import { OpeningHoursInput } from '@/components/admin/OpeningHoursInput';
import { MetadataFields } from '@/components/admin/MetadataFields';
import { generateSlug } from '@/lib/utils/slug';
import { cn } from '@/lib/utils';

type Mode = 'create' | 'edit';

type ItemFormProps = {
  mode: Mode;
  categories: Category[];
  /** Untuk mode edit — data awal dari server. */
  initial?: Item | null;
  /** URL aplikasi (APP_URL) untuk preview slug. */
  appUrl?: string;
};

// Shape state internal — sengaja flat supaya mudah di-bind ke form control.
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
  const [saving, setSaving] = useState<null | 'draft' | 'publish' | 'update'>(null);
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
      // Auto-generate slug kalau user belum mengetuk field slug.
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

  const slugPreview = appUrl && activeCategory?.slug && state.slug
    ? `${appUrl.replace(/\/$/, '')}/${activeCategory.slug}/${state.slug}`
    : null;

  return (
    <div className="space-y-6 pb-28">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* Informasi Utama */}
      <FormSection title="Informasi Utama">
        <TwoCol>
          <Field label="Kategori" required>
            <select
              value={state.category_id}
              onChange={(e) => patch('category_id', e.target.value)}
              className={inputCls}
            >
              <option value="">— Pilih kategori —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            <input
              type="text"
              value={state.subcategory}
              onChange={(e) => patch('subcategory', e.target.value)}
              placeholder="Contoh: KTP, Wisata Alam…"
              className={inputCls}
            />
          </Field>
        </TwoCol>

        <Field label="Judul" required>
          <input
            type="text"
            value={state.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Nama layanan / destinasi"
            className={inputCls}
          />
        </Field>

        <Field label="Slug" required help="Otomatis diisi dari judul — edit jika perlu.">
          <input
            type="text"
            value={state.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="slug-url-friendly"
            className={inputCls}
          />
          {slugPreview && (
            <p className="mt-1.5 truncate text-xs text-slate-500">
              URL: <span className="font-mono">{slugPreview}</span>
            </p>
          )}
        </Field>

        <Field
          label="Deskripsi"
          help={`${state.description.length} / 300 karakter`}
        >
          <textarea
            rows={3}
            maxLength={300}
            value={state.description}
            onChange={(e) => patch('description', e.target.value)}
            placeholder="Deskripsi singkat untuk card & hasil pencarian."
            className={inputCls}
          />
        </Field>

        <Field label="Konten / Panduan">
          <textarea
            rows={10}
            value={state.content}
            onChange={(e) => patch('content', e.target.value)}
            placeholder="Penjelasan lengkap — minimal 10 baris. Dukung line-break biasa."
            className={inputCls}
          />
        </Field>

        <Field label="Tags" help="Ketik tag lalu tekan Enter.">
          <TagInput
            value={state.tags}
            onChange={(t) => patch('tags', t)}
            placeholder="tuban, wisata-alam, kuliner…"
          />
        </Field>
      </FormSection>

      {/* Kontak */}
      <FormSection title="Kontak" description="Kosongkan field yang tidak berlaku.">
        <TwoCol>
          <Field label="Telepon">
            <input
              type="tel"
              value={state.phone}
              onChange={(e) => patch('phone', e.target.value)}
              placeholder="+62…"
              className={inputCls}
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={state.whatsapp}
              onChange={(e) => patch('whatsapp', e.target.value)}
              placeholder="+62…"
              className={inputCls}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={state.email}
              onChange={(e) => patch('email', e.target.value)}
              placeholder="nama@contoh.com"
              className={inputCls}
            />
          </Field>
          <Field label="Website">
            <input
              type="url"
              value={state.website}
              onChange={(e) => patch('website', e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
        </TwoCol>
      </FormSection>

      {/* Lokasi */}
      <FormSection title="Lokasi">
        <Field label="Alamat">
          <textarea
            rows={2}
            value={state.address}
            onChange={(e) => patch('address', e.target.value)}
            placeholder="Jalan, nomor, RT/RW, kelurahan…"
            className={inputCls}
          />
        </Field>
        <TwoCol>
          <Field label="Kecamatan">
            <input
              type="text"
              value={state.district}
              onChange={(e) => patch('district', e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Google Maps URL">
            <input
              type="url"
              value={state.gmaps_url}
              onChange={(e) => patch('gmaps_url', e.target.value)}
              placeholder="https://maps.google.com/…"
              className={inputCls}
            />
          </Field>
        </TwoCol>
        <TwoCol>
          <Field label="Latitude">
            <input
              type="number"
              step="any"
              value={state.lat}
              onChange={(e) => patch('lat', e.target.value)}
              placeholder="-6.8970"
              className={inputCls}
            />
          </Field>
          <Field label="Longitude">
            <input
              type="number"
              step="any"
              value={state.lng}
              onChange={(e) => patch('lng', e.target.value)}
              placeholder="111.9125"
              className={inputCls}
            />
          </Field>
        </TwoCol>
      </FormSection>

      {/* Jam operasional */}
      <FormSection
        title="Jam Operasional"
        description="Aktifkan hari yang relevan. Pilih '24 jam' atau atur rentang jam."
      >
        <OpeningHoursInput
          value={state.opening_hours}
          onChange={(v) => patch('opening_hours', v)}
        />
      </FormSection>

      {/* Media */}
      <FormSection title="Media">
        <Field label="Thumbnail URL">
          <input
            type="url"
            value={state.thumbnail_url}
            onChange={(e) => patch('thumbnail_url', e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </Field>
        <ImagePreview src={state.thumbnail_url} alt="Preview thumbnail" />

        <Field label="Gambar Tambahan">
          <ImageListInput
            value={state.images}
            onChange={(imgs) => patch('images', imgs)}
          />
        </Field>
      </FormSection>

      {/* Metadata dinamis */}
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

      {/* Pengaturan */}
      <FormSection title="Pengaturan">
        <div className="space-y-2">
          <Toggle
            label="Publikasikan item ini"
            description="Saat aktif, item akan muncul di website publik."
            checked={state.is_published}
            onChange={(v) => patch('is_published', v)}
          />
          <Toggle
            label="Tandai sebagai terverifikasi"
            description="Tampilkan badge 'Terverifikasi' pada card & halaman detail."
            checked={state.is_verified}
            onChange={(v) => patch('is_verified', v)}
          />
        </div>
      </FormSection>

      {mode === 'edit' && (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <h3 className="text-sm font-semibold text-red-800">Zona Berbahaya</h3>
          <p className="mt-1 text-xs text-red-700">
            Menghapus item akan menghilangkannya secara permanen dari sistem.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Hapus Item
          </button>
        </div>
      )}

      {/* Action bar sticky */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:left-60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-end gap-2">
          <Link
            href="/admin/items"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </Link>
          {mode === 'create' ? (
            <>
              <ActionButton
                icon={Save}
                label="Simpan Draft"
                variant="outline"
                loading={saving === 'draft'}
                disabled={saving !== null}
                onClick={() => handleSubmit('draft')}
              />
              <ActionButton
                icon={Send}
                label="Simpan & Publikasikan"
                loading={saving === 'publish'}
                disabled={saving !== null}
                onClick={() => handleSubmit('publish')}
              />
            </>
          ) : (
            <ActionButton
              icon={Save}
              label="Simpan Perubahan"
              loading={saving === 'update'}
              disabled={saving !== null}
              onClick={() => handleSubmit('update')}
            />
          )}
        </div>
      </div>

      {/* Dialog konfirmasi hapus */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              Hapus item ini?
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Tindakan ini tidak dapat dibatalkan.{' '}
              <span className="font-medium">{initial?.title}</span> akan dihapus
              permanen dari database.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------- subcomponents -------

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {help && <p className="mt-1.5 text-xs text-slate-500">{help}</p>}
    </label>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Toggle({
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
    <label className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className="text-sm">
        <span className="block font-medium text-slate-800">{label}</span>
        {description && (
          <span className="block text-xs text-slate-500">{description}</span>
        )}
      </span>
    </label>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  disabled,
  variant = 'primary',
}: {
  icon: typeof Save;
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={variant === 'outline' ? 'outline' : 'default'}
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <Icon className="h-4 w-4" aria-hidden />
      )}
      {label}
    </Button>
  );
}

// Input list gambar — tambah/hapus URL.
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
        <p className="text-xs text-slate-500">
          Belum ada gambar tambahan. Klik{' '}
          <span className="font-semibold">Tambah URL</span> untuk menambah.
        </p>
      )}
      {value.map((url, idx) => (
        <div key={idx} className={cn('flex items-start gap-2')}>
          <div className="flex-1 space-y-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateAt(idx, e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
            {url && <ImagePreview src={url} ratio="16/9" />}
          </div>
          <button
            type="button"
            onClick={() => removeAt(idx)}
            aria-label="Hapus URL"
            className="mt-1 rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:text-red-600"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Tambah URL
      </button>
    </div>
  );
}
