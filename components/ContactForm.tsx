'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

type FormState = {
  name: string;
  email: string;
  message: string;
};

const INITIAL: FormState = { name: '', email: '', message: '' };

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Nama wajib diisi.');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Pesan wajib diisi.');
      return;
    }
    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      toast.error('Format email tidak valid.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || null,
          message: form.message.trim(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        toast.error(body?.error ?? 'Gagal mengirim pesan.');
        return;
      }

      toast.success('Terima kasih! Pesanmu sudah kami terima.');
      setForm(INITIAL);
    } catch (err) {
      console.error('[ContactForm]', err);
      toast.error('Tidak bisa menghubungi server. Cek koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="c-name">
          Nama <span className="text-destructive">*</span>
        </Label>
        <Input
          id="c-name"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          maxLength={120}
          placeholder="Nama lengkap"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-email">Email (opsional)</Label>
        <Input
          id="c-email"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="nama@contoh.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="c-message">
          Pesan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="c-message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          maxLength={4000}
          placeholder="Tulis pesan, saran, atau pertanyaanmu di sini."
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {loading ? 'Mengirim…' : 'Kirim Pesan'}
        </Button>
      </div>
    </form>
  );
}
