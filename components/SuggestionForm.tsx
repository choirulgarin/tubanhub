'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import type { Category } from '@/types';

type Props = {
  categories: Category[];
};

type FormState = {
  name: string;
  category: string;
  address: string;
  description: string;
  contact: string;
  submitted_by: string;
};

const INITIAL: FormState = {
  name: '',
  category: '',
  address: '',
  description: '',
  contact: '',
  submitted_by: '',
};

// Form client-side untuk mengirim usulan tempat ke /api/suggestions.
// Setelah sukses: reset form + tampilkan toast.
export function SuggestionForm({ categories }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama tempat/layanan wajib diisi.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category || null,
          address: form.address.trim() || null,
          description: form.description.trim() || null,
          contact: form.contact.trim() || null,
          submitted_by: form.submitted_by.trim() || null,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast.error(body?.error ?? 'Gagal mengirim usulan. Coba lagi.');
        return;
      }

      toast.success('Terima kasih! Usulan Anda sudah kami terima.');
      setForm(INITIAL);
    } catch (err) {
      console.error('[SuggestionForm]', err);
      toast.error('Tidak bisa menghubungi server. Cek koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-2xl bg-white p-6 shadow-card md:p-8"
      noValidate
    >
      <Field
        id="name"
        label="Nama tempat / layanan"
        required
        value={form.name}
        onChange={(v) => update('name', v)}
        placeholder="Contoh: Warung Soto Pak Slamet"
        maxLength={200}
      />

      <label htmlFor="category" className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-600">
          Kategori
        </span>
        <select
          id="category"
          value={form.category}
          onChange={(e) => update('category', e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">— Pilih kategori (opsional) —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <Field
        id="address"
        label="Alamat / kelurahan"
        value={form.address}
        onChange={(v) => update('address', v)}
        placeholder="Contoh: Jl. Basuki Rahmat No. 10, Latsari"
        maxLength={300}
      />

      <label htmlFor="description" className="block">
        <span className="mb-1.5 block text-xs font-medium text-slate-600">
          Deskripsi singkat
        </span>
        <textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={2000}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Apa yang membuat tempat/layanan ini menarik?"
        />
      </label>

      <Field
        id="contact"
        label="Kontak tempat (opsional)"
        value={form.contact}
        onChange={(v) => update('contact', v)}
        placeholder="Nomor WA, telepon, atau website"
        maxLength={120}
      />

      <Field
        id="submitted_by"
        label="Nama Anda (opsional)"
        value={form.submitted_by}
        onChange={(v) => update('submitted_by', v)}
        placeholder="Agar kami bisa menghubungi jika perlu verifikasi"
        maxLength={120}
      />

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {loading ? 'Mengirim…' : 'Kirim Usulan'}
        </button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      <input
        id={id}
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
