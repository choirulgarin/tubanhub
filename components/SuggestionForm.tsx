'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
  submitted_contact: string;
};

const INITIAL: FormState = {
  name: '',
  category: '',
  address: '',
  description: '',
  contact: '',
  submitted_by: '',
  submitted_contact: '',
};

export function SuggestionForm({ categories }: Props) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          submitted_contact: form.submitted_contact.trim() || null,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast.error(body?.error ?? 'Gagal mengirim usulan. Coba lagi.');
        return;
      }

      setForm(INITIAL);
      setSubmitted(true);
    } catch (err) {
      console.error('[SuggestionForm]', err);
      toast.error('Tidak bisa menghubungi server. Cek koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 animate-in zoom-in-50 fade-in items-center justify-center rounded-full bg-secondary text-secondary-foreground duration-500">
          <CheckCircle2 className="h-6 w-6" strokeWidth={2} aria-hidden />
        </div>
        <h2 className="mt-4 text-base font-medium text-foreground">
          Usulan terkirim
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Terima kasih sudah berkontribusi. Tim editor akan meninjau usulan Anda
          dalam <span className="font-medium text-foreground">1-3 hari kerja</span>.
        </p>
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSubmitted(false)}
          >
            Kirim usulan lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Nama tempat / layanan <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Contoh: Warung Soto Pak Slamet"
          maxLength={200}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">
          Kategori <span className="text-destructive">*</span>
        </Label>
        <Select
          value={form.category}
          onValueChange={(v) => update('category', v ?? '')}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Alamat / kelurahan</Label>
        <Input
          id="address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          placeholder="Contoh: Jl. Basuki Rahmat No. 10, Latsari"
          maxLength={300}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Deskripsi singkat</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          maxLength={2000}
          placeholder="Apa yang membuat tempat/layanan ini menarik?"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact">Kontak tempat (opsional)</Label>
        <Input
          id="contact"
          value={form.contact}
          onChange={(e) => update('contact', e.target.value)}
          placeholder="Nomor WA, telepon, atau website"
          maxLength={120}
        />
      </div>

      <div className={cn('grid gap-5 sm:grid-cols-2')}>
        <div className="space-y-1.5">
          <Label htmlFor="submitted_by">Nama Anda (opsional)</Label>
          <Input
            id="submitted_by"
            value={form.submitted_by}
            onChange={(e) => update('submitted_by', e.target.value)}
            placeholder="Biar kami tahu yang mengusulkan"
            maxLength={120}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="submitted_contact">No. WA Anda (opsional)</Label>
          <Input
            id="submitted_contact"
            type="tel"
            inputMode="tel"
            value={form.submitted_contact}
            onChange={(e) => update('submitted_contact', e.target.value)}
            placeholder="Untuk konfirmasi verifikasi"
            maxLength={30}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {loading ? 'Mengirim…' : 'Kirim Usulan'}
        </Button>
      </div>
    </form>
  );
}
