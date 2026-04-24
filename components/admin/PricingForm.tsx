'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormSection } from '@/components/admin/FormSection';
import type { PricingConfig } from '@/types';

type Props = {
  tier: PricingConfig;
};

type FormState = {
  tier_label: string;
  tagline: string;
  price_monthly: string;
  price_yearly: string;
  price_note: string;
  cta_label: string;
  cta_href: string;
  features: string[];
  is_featured: boolean;
  is_active: boolean;
  order_index: string;
};

export function PricingForm({ tier }: Props) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    tier_label: tier.tier_label,
    tagline: tier.tagline ?? '',
    price_monthly: String(tier.price_monthly),
    price_yearly: String(tier.price_yearly),
    price_note: tier.price_note ?? '',
    cta_label: tier.cta_label ?? '',
    cta_href: tier.cta_href ?? '',
    features: [...tier.features],
    is_featured: tier.is_featured,
    is_active: tier.is_active,
    order_index: String(tier.order_index),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function addFeature() {
    setState((s) => ({ ...s, features: [...s.features, ''] }));
  }
  function updateFeature(i: number, v: string) {
    setState((s) => {
      const next = [...s.features];
      next[i] = v;
      return { ...s, features: next };
    });
  }
  function removeFeature(i: number) {
    setState((s) => ({
      ...s,
      features: s.features.filter((_, idx) => idx !== i),
    }));
  }

  async function submit() {
    setError(null);
    if (!state.tier_label.trim()) {
      setError('Label paket wajib diisi.');
      return;
    }
    setSaving(true);

    const payload = {
      tier_label: state.tier_label.trim(),
      tagline: state.tagline.trim() || null,
      price_monthly: Number(state.price_monthly) || 0,
      price_yearly: Number(state.price_yearly) || 0,
      price_note: state.price_note.trim() || null,
      cta_label: state.cta_label.trim() || null,
      cta_href: state.cta_href.trim() || null,
      features: state.features.map((f) => f.trim()).filter(Boolean),
      is_featured: state.is_featured,
      is_active: state.is_active,
      order_index: Number(state.order_index) || 0,
    };

    try {
      const res = await fetch(`/api/pricing/${tier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !body?.ok) {
        setError(body?.error ?? 'Gagal menyimpan.');
        setSaving(false);
        return;
      }

      toast.success('Paket disimpan.');
      router.push('/admin/pricing');
      router.refresh();
    } catch (err) {
      console.error('[PricingForm]', err);
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

      <FormSection
        title="Identitas"
        description={`Key: ${tier.tier_key} (tidak dapat diubah)`}
      >
        <div className="space-y-1.5">
          <Label htmlFor="p-label">
            Label <span className="text-destructive">*</span>
          </Label>
          <Input
            id="p-label"
            value={state.tier_label}
            onChange={(e) => patch('tier_label', e.target.value)}
            maxLength={60}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-tagline">Tagline</Label>
          <Textarea
            id="p-tagline"
            value={state.tagline}
            onChange={(e) => patch('tagline', e.target.value)}
            rows={2}
            maxLength={160}
            placeholder="Contoh: Border biru + posisi atas grid"
          />
        </div>
      </FormSection>

      <FormSection title="Harga">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-monthly">Harga bulanan (Rp)</Label>
            <Input
              id="p-monthly"
              type="number"
              min={0}
              value={state.price_monthly}
              onChange={(e) => patch('price_monthly', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-yearly">Harga tahunan (Rp)</Label>
            <Input
              id="p-yearly"
              type="number"
              min={0}
              value={state.price_yearly}
              onChange={(e) => patch('price_yearly', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-note">Catatan harga</Label>
          <Input
            id="p-note"
            value={state.price_note}
            onChange={(e) => patch('price_note', e.target.value)}
            placeholder='Contoh: "Per listing, per bulan"'
            maxLength={120}
          />
        </div>
      </FormSection>

      <FormSection title="Fitur">
        <div className="space-y-2">
          {state.features.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Belum ada fitur. Tambahkan item di bawah.
            </p>
          )}
          {state.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={f}
                onChange={(e) => updateFeature(i, e.target.value)}
                placeholder={`Fitur ${i + 1}`}
                maxLength={160}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeFeature(i)}
                aria-label={`Hapus fitur ${i + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addFeature}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Tambah fitur
          </Button>
        </div>
      </FormSection>

      <FormSection title="Call-to-action">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-cta-label">Label tombol</Label>
            <Input
              id="p-cta-label"
              value={state.cta_label}
              onChange={(e) => patch('cta_label', e.target.value)}
              placeholder="Hubungi Admin"
              maxLength={40}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-cta-href">URL tujuan</Label>
            <Input
              id="p-cta-href"
              value={state.cta_href}
              onChange={(e) => patch('cta_href', e.target.value)}
              placeholder="https://wa.me/62..."
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Tampilan & Status">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-order">Urutan tampil</Label>
            <Input
              id="p-order"
              type="number"
              min={0}
              value={state.order_index}
              onChange={(e) => patch('order_index', e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Tandai sebagai &ldquo;Populer&rdquo;</p>
            <p className="text-xs text-muted-foreground">
              Card akan di-highlight dengan border amber di halaman harga.
            </p>
          </div>
          <Switch
            checked={state.is_featured}
            onCheckedChange={(v) => patch('is_featured', v)}
            aria-label="Paling populer"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div>
            <p className="text-sm font-medium text-foreground">Paket aktif</p>
            <p className="text-xs text-muted-foreground">
              Nonaktifkan agar paket tidak muncul di /harga.
            </p>
          </div>
          <Switch
            checked={state.is_active}
            onCheckedChange={(v) => patch('is_active', v)}
            aria-label="Paket aktif"
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/pricing">
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
          Simpan Paket
        </Button>
      </div>
    </form>
  );
}
