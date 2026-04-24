'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type State = {
  listing_type: string;
  listing_name: string;
  owner_name: string;
  proof_url: string;
  contact_wa: string;
  contact_email: string;
};

const INITIAL: State = {
  listing_type: 'influencer',
  listing_name: '',
  owner_name: '',
  proof_url: '',
  contact_wa: '',
  contact_email: '',
};

export function ClaimForm() {
  const [state, setState] = useState<State>(INITIAL);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof State>(key: K, value: State[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!state.listing_name.trim()) return toast.error('Nama listing wajib diisi.');
    if (!state.owner_name.trim()) return toast.error('Nama pemilik wajib diisi.');
    if (!state.contact_wa.trim() && !state.contact_email.trim()) {
      return toast.error('WA atau email wajib diisi.');
    }

    setLoading(true);
    try {
      const res = await fetch('/api/claim-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? 'Gagal mengirim klaim.');
        return;
      }

      toast.success('Klaim terkirim! Tim TubanHub akan menghubungi kamu.');
      setState(INITIAL);
    } catch (err) {
      console.error('[ClaimForm]', err);
      toast.error('Tidak bisa menghubungi server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="claim-type">
          Jenis Listing <span className="text-destructive">*</span>
        </Label>
        <Select
          value={state.listing_type}
          onValueChange={(v) => v && update('listing_type', v)}
        >
          <SelectTrigger id="claim-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="influencer">Influencer</SelectItem>
            <SelectItem value="wisata">Wisata</SelectItem>
            <SelectItem value="kuliner">Kuliner</SelectItem>
            <SelectItem value="jasa">Jasa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claim-name">
          Nama Listing <span className="text-destructive">*</span>
        </Label>
        <Input
          id="claim-name"
          required
          value={state.listing_name}
          onChange={(e) => update('listing_name', e.target.value)}
          maxLength={200}
          placeholder="Nama persis listing di TubanHub"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claim-owner">
          Nama Pemilik <span className="text-destructive">*</span>
        </Label>
        <Input
          id="claim-owner"
          required
          value={state.owner_name}
          onChange={(e) => update('owner_name', e.target.value)}
          maxLength={120}
          placeholder="Nama lengkap kamu"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="claim-proof">Bukti Kepemilikan</Label>
        <Input
          id="claim-proof"
          type="url"
          value={state.proof_url}
          onChange={(e) => update('proof_url', e.target.value)}
          placeholder="Link sosmed / Google Maps / website"
        />
        <p className="text-xs text-muted-foreground">
          Sertakan link untuk mempercepat verifikasi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="claim-wa">Nomor WhatsApp</Label>
          <Input
            id="claim-wa"
            value={state.contact_wa}
            onChange={(e) => update('contact_wa', e.target.value)}
            maxLength={60}
            placeholder="08xx"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="claim-email">Email</Label>
          <Input
            id="claim-email"
            type="email"
            value={state.contact_email}
            onChange={(e) => update('contact_email', e.target.value)}
            maxLength={200}
            placeholder="nama@contoh.com"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Salah satu kontak di atas wajib diisi.
      </p>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )}
          {loading ? 'Mengirim…' : 'Ajukan Klaim'}
        </Button>
      </div>
    </form>
  );
}
