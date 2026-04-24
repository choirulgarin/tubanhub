'use client';

import type { ItemMetadata } from '@/types';
import { TagInput } from '@/components/admin/TagInput';

type MetadataFieldsProps = {
  categorySlug: string | null;
  value: ItemMetadata;
  onChange: (next: ItemMetadata) => void;
};

// Fields metadata berubah menyesuaikan kategori — hanya field yang relevan
// yang ditampilkan sehingga admin tidak bingung dengan kolom kosong.
export function MetadataFields({
  categorySlug,
  value,
  onChange,
}: MetadataFieldsProps) {
  function set(key: string, v: unknown) {
    const next = { ...(value ?? {}) };
    if (v == null || v === '' || (Array.isArray(v) && v.length === 0)) {
      delete next[key];
    } else {
      next[key] = v;
    }
    onChange(next);
  }

  function str(key: string): string {
    const v = value?.[key];
    return typeof v === 'string' ? v : '';
  }
  function arr(key: string): string[] {
    const v = value?.[key];
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  }
  function bool(key: string): boolean {
    const v = value?.[key];
    return v === true;
  }

  if (!categorySlug) {
    return (
      <p className="text-xs text-slate-500">
        Pilih kategori terlebih dulu untuk menampilkan field metadata.
      </p>
    );
  }

  switch (categorySlug) {
    case 'birokrasi':
      return (
        <div className="space-y-4">
          <Field label="Syarat & Dokumen">
            <TagInput
              value={arr('syarat')}
              onChange={(t) => set('syarat', t)}
              placeholder="Tambah syarat, tekan Enter…"
            />
          </Field>
          <TwoCol>
            <Field label="Biaya">
              <TextInput
                value={str('biaya')}
                onChange={(v) => set('biaya', v)}
                placeholder="Contoh: Gratis / Rp 50.000"
              />
            </Field>
            <Field label="Estimasi Waktu">
              <TextInput
                value={str('estimasi_waktu')}
                onChange={(v) => set('estimasi_waktu', v)}
                placeholder="Contoh: 1–3 hari kerja"
              />
            </Field>
          </TwoCol>
          <Field label="Dasar Hukum">
            <TextInput
              value={str('dasar_hukum')}
              onChange={(v) => set('dasar_hukum', v)}
              placeholder="Contoh: UU No. 24 Tahun 2013"
            />
          </Field>
          <Field label="Catatan Tambahan">
            <Textarea
              value={str('catatan')}
              onChange={(v) => set('catatan', v)}
              rows={3}
            />
          </Field>
          <Field label="Nomor Antrian (URL)">
            <TextInput
              value={str('nomor_antrian_url')}
              onChange={(v) => set('nomor_antrian_url', v)}
              placeholder="https://…"
              type="url"
            />
          </Field>
        </div>
      );

    case 'wisata':
      return (
        <div className="space-y-4">
          <TwoCol>
            <Field label="Harga Tiket">
              <TextInput
                value={str('harga_tiket')}
                onChange={(v) => set('harga_tiket', v)}
                placeholder="Contoh: Rp 10.000"
              />
            </Field>
            <Field label="Jam Buka (ringkas)">
              <TextInput
                value={str('jam_buka')}
                onChange={(v) => set('jam_buka', v)}
                placeholder="Contoh: 08:00 – 17:00"
              />
            </Field>
          </TwoCol>
          <Field label="Fasilitas">
            <TagInput
              value={arr('fasilitas')}
              onChange={(t) => set('fasilitas', t)}
              placeholder="Contoh: Toilet, Musala, Parkir…"
            />
          </Field>
          <Field label="Tips Berkunjung">
            <TagInput
              value={arr('tips')}
              onChange={(t) => set('tips', t)}
              placeholder="Tambah tips, tekan Enter…"
            />
          </Field>
        </div>
      );

    case 'kuliner':
      return (
        <div className="space-y-4">
          <TwoCol>
            <Field label="Kisaran Harga">
              <TextInput
                value={str('price_range')}
                onChange={(v) => set('price_range', v)}
                placeholder="Contoh: Rp 15.000 – Rp 50.000"
              />
            </Field>
            <Field label="Halal">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bool('halal')}
                  onChange={(e) => set('halal', e.target.checked || null)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                Bersertifikat / diakui halal
              </label>
            </Field>
          </TwoCol>
          <Field label="Menu Andalan">
            <TagInput
              value={arr('menu_andalan')}
              onChange={(t) => set('menu_andalan', t)}
              placeholder="Tambah menu, tekan Enter…"
            />
          </Field>
        </div>
      );

    case 'jasa':
      return (
        <div className="space-y-4">
          <TwoCol>
            <Field label="Harga Mulai">
              <TextInput
                value={str('harga_mulai')}
                onChange={(v) => set('harga_mulai', v)}
                placeholder="Contoh: Rp 100.000"
              />
            </Field>
            <Field label="Armada / Peralatan">
              <TextInput
                value={str('armada')}
                onChange={(v) => set('armada', v)}
                placeholder="Contoh: Avanza, Innova"
              />
            </Field>
          </TwoCol>
          <Field label="Area Layanan">
            <TextInput
              value={str('area_layanan')}
              onChange={(v) => set('area_layanan', v)}
              placeholder="Contoh: Tuban & sekitarnya"
            />
          </Field>
        </div>
      );

    default:
      return (
        <p className="text-xs text-slate-500">
          Tidak ada field metadata khusus untuk kategori ini.
        </p>
      );
  }
}

// --- small UI helpers (private) ---
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}
