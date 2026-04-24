'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormSection } from '@/components/admin/FormSection';

export type ListingOption = {
  id: string;
  label: string;
  category_slug?: string | null;
};

type Props = {
  itemOptions: ListingOption[];
  influencerOptions: ListingOption[];
};

type ListingType = 'items' | 'influencer';
type Tier = 'basic' | 'highlight' | 'featured';
type Duration = '1' | '3' | '6' | '12' | 'custom';

const TIERS: Array<{ value: Tier; label: string; desc: string }> = [
  { value: 'basic', label: 'Basic', desc: 'Prioritas ringan, badge sederhana.' },
  { value: 'highlight', label: 'Highlight', desc: 'Border biru, naik ke atas grid.' },
  { value: 'featured', label: 'Featured', desc: 'Border amber, pin icon, paling atas.' },
];

const DURATIONS: Array<{ value: Duration; label: string }> = [
  { value: '1', label: '1 bulan' },
  { value: '3', label: '3 bulan' },
  { value: '6', label: '6 bulan' },
  { value: '12', label: '12 bulan' },
  { value: 'custom', label: 'Custom (pilih tanggal)' },
];

function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toLocalDatetimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalDatetimeInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function HighlightForm({ itemOptions, influencerOptions }: Props) {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>('items');
  const [listingId, setListingId] = useState<string>('');
  const [tier, setTier] = useState<Tier>('highlight');
  const [duration, setDuration] = useState<Duration>('1');
  const [customExpiry, setCustomExpiry] = useState<string>(
    toLocalDatetimeInput(addMonths(new Date(), 1)),
  );
  const [paymentRef, setPaymentRef] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listings = listingType === 'items' ? itemOptions : influencerOptions;
  const selectedListing = useMemo(
    () => listings.find((l) => l.id === listingId) ?? null,
    [listings, listingId],
  );

  async function submit() {
    setError(null);
    if (!listingId) {
      setError('Pilih listing yang akan di-highlight.');
      return;
    }

    let expiresIso: string | null = null;
    if (duration === 'custom') {
      expiresIso = fromLocalDatetimeInput(customExpiry);
      if (!expiresIso) {
        setError('Tanggal custom tidak valid.');
        return;
      }
    } else {
      expiresIso = addMonths(new Date(), Number(duration)).toISOString();
    }

    setSaving(true);
    const payload = {
      listing_type: listingType,
      listing_id: listingId,
      tier,
      category_slug: selectedListing?.category_slug ?? null,
      starts_at: new Date().toISOString(),
      expires_at: expiresIso,
      payment_ref: paymentRef.trim() || null,
      is_active: true,
    };

    try {
      const res = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !body?.ok) {
        setError(body?.error ?? 'Gagal membuat highlight.');
        setSaving(false);
        return;
      }

      toast.success('Highlight diaktifkan.');
      router.push('/admin/highlights');
      router.refresh();
    } catch (err) {
      console.error('[HighlightForm]', err);
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

      <FormSection title="Listing">
        <div className="space-y-1.5">
          <Label>Jenis listing</Label>
          <Select
            value={listingType}
            onValueChange={(v) => {
              if (!v) return;
              setListingType(v as ListingType);
              setListingId('');
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="items">Item (birokrasi/wisata/kuliner/jasa)</SelectItem>
              <SelectItem value="influencer">Influencer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Pilih listing</Label>
          <Select value={listingId} onValueChange={(v) => v && setListingId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="— pilih —" />
            </SelectTrigger>
            <SelectContent>
              {listings.length === 0 ? (
                <SelectItem value="__none__" disabled>
                  Tidak ada listing tersedia.
                </SelectItem>
              ) : (
                listings.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Hanya listing yang sudah dipublikasikan yang muncul di sini.
          </p>
        </div>
      </FormSection>

      <FormSection title="Tier & Durasi">
        <div className="space-y-1.5">
          <Label>Tier</Label>
          <Select value={tier} onValueChange={(v) => v && setTier(v as Tier)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIERS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label} — {t.desc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Durasi</Label>
          <Select
            value={duration}
            onValueChange={(v) => v && setDuration(v as Duration)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {duration === 'custom' && (
          <div className="space-y-1.5">
            <Label htmlFor="hl-custom-expiry">Tanggal berakhir</Label>
            <Input
              id="hl-custom-expiry"
              type="datetime-local"
              value={customExpiry}
              onChange={(e) => setCustomExpiry(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="hl-payment-ref">Referensi pembayaran (opsional)</Label>
          <Input
            id="hl-payment-ref"
            value={paymentRef}
            onChange={(e) => setPaymentRef(e.target.value)}
            placeholder="Transfer ID / catatan internal"
            maxLength={160}
          />
        </div>
      </FormSection>

      <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-xl md:border md:px-4">
        <Button variant="ghost" asChild disabled={saving}>
          <Link href="/admin/highlights">
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
          Aktifkan Highlight
        </Button>
      </div>
    </form>
  );
}
