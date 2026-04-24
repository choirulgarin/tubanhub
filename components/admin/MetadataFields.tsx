'use client';

import type { ItemMetadata } from '@/types';
import { TagInput } from '@/components/admin/TagInput';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type MetadataFieldsProps = {
  categorySlug: string | null;
  value: ItemMetadata;
  onChange: (next: ItemMetadata) => void;
};

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
    return Array.isArray(v)
      ? v.filter((x): x is string => typeof x === 'string')
      : [];
  }
  function bool(key: string): boolean {
    const v = value?.[key];
    return v === true;
  }

  if (!categorySlug) {
    return (
      <p className="text-xs text-muted-foreground">
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
              <Input
                value={str('biaya')}
                onChange={(e) => set('biaya', e.target.value)}
                placeholder="Contoh: Gratis / Rp 50.000"
              />
            </Field>
            <Field label="Estimasi Waktu">
              <Input
                value={str('estimasi_waktu')}
                onChange={(e) => set('estimasi_waktu', e.target.value)}
                placeholder="Contoh: 1–3 hari kerja"
              />
            </Field>
          </TwoCol>
          <Field label="Dasar Hukum">
            <Input
              value={str('dasar_hukum')}
              onChange={(e) => set('dasar_hukum', e.target.value)}
              placeholder="Contoh: UU No. 24 Tahun 2013"
            />
          </Field>
          <Field label="Catatan Tambahan">
            <Textarea
              value={str('catatan')}
              onChange={(e) => set('catatan', e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Nomor Antrian (URL)">
            <Input
              type="url"
              value={str('nomor_antrian_url')}
              onChange={(e) => set('nomor_antrian_url', e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      );

    case 'wisata':
      return (
        <div className="space-y-4">
          <TwoCol>
            <Field label="Harga Tiket">
              <Input
                value={str('harga_tiket')}
                onChange={(e) => set('harga_tiket', e.target.value)}
                placeholder="Contoh: Rp 10.000"
              />
            </Field>
            <Field label="Jam Buka (ringkas)">
              <Input
                value={str('jam_buka')}
                onChange={(e) => set('jam_buka', e.target.value)}
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
              <Input
                value={str('price_range')}
                onChange={(e) => set('price_range', e.target.value)}
                placeholder="Contoh: Rp 15.000 – Rp 50.000"
              />
            </Field>
            <Field label="Halal">
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={bool('halal')}
                  onChange={(e) => set('halal', e.target.checked || null)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
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
              <Input
                value={str('harga_mulai')}
                onChange={(e) => set('harga_mulai', e.target.value)}
                placeholder="Contoh: Rp 100.000"
              />
            </Field>
            <Field label="Armada / Peralatan">
              <Input
                value={str('armada')}
                onChange={(e) => set('armada', e.target.value)}
                placeholder="Contoh: Avanza, Innova"
              />
            </Field>
          </TwoCol>
          <Field label="Area Layanan">
            <Input
              value={str('area_layanan')}
              onChange={(e) => set('area_layanan', e.target.value)}
              placeholder="Contoh: Tuban & sekitarnya"
            />
          </Field>
        </div>
      );

    default:
      return (
        <p className="text-xs text-muted-foreground">
          Tidak ada field metadata khusus untuk kategori ini.
        </p>
      );
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
