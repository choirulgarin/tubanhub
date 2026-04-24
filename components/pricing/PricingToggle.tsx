'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PricingConfig } from '@/types';

type Billing = 'monthly' | 'yearly';

function formatRupiah(n: number): string {
  if (n === 0) return 'Gratis';
  if (n < 1_000_000) {
    return `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;
  }
  return `Rp ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}jt`;
}

type Props = {
  tiers: PricingConfig[];
};

// Wrap Pricing interaktif — toggle billing period + grid cards.
export function PricingToggle({ tiers }: Props) {
  const [billing, setBilling] = useState<Billing>('monthly');

  const mainTiers = tiers.filter((t) => t.tier_key !== 'klaim');
  const klaim = tiers.find((t) => t.tier_key === 'klaim');

  const hasYearlyDifference = mainTiers.some(
    (t) => t.price_yearly > 0 && t.price_yearly < t.price_monthly * 12,
  );

  return (
    <>
      {/* Toggle billing */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Periode pembayaran"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'monthly'}
            onClick={() => setBilling('monthly')}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              billing === 'monthly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Bulanan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={billing === 'yearly'}
            onClick={() => setBilling('yearly')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              billing === 'yearly'
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Tahunan
            {hasYearlyDifference && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Hemat
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Grid main tiers */}
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainTiers.map((tier) => {
          const price = billing === 'monthly' ? tier.price_monthly : tier.price_yearly;
          const periodLabel =
            price === 0
              ? null
              : billing === 'monthly'
                ? '/ bulan'
                : '/ tahun';
          const highlighted = tier.is_featured;

          return (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-6',
                highlighted
                  ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                  : 'border-border',
              )}
            >
              {highlighted && (
                <span className="absolute -top-3 left-6 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  Paling populer
                </span>
              )}
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {tier.tier_label}
                </h3>
                {tier.tagline && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tier.tagline}
                  </p>
                )}
              </div>
              <div className="mt-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight text-foreground">
                    {formatRupiah(price)}
                  </span>
                  {periodLabel && (
                    <span className="text-xs text-muted-foreground">
                      {periodLabel}
                    </span>
                  )}
                </div>
                {tier.price_note && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tier.price_note}
                  </p>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-foreground"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                      aria-hidden
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.cta_href && tier.cta_label && (
                <a
                  href={tier.cta_href}
                  target={tier.cta_href.startsWith('http') ? '_blank' : undefined}
                  rel={tier.cta_href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={cn(
                    'mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    highlighted
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'border border-border text-foreground hover:bg-muted',
                  )}
                >
                  {tier.cta_label}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Klaim card (dashed, separate) */}
      {klaim && (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-6 md:flex md:items-center md:justify-between md:gap-6">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              {klaim.tier_label}
            </h3>
            {klaim.tagline && (
              <p className="mt-1 text-xs text-muted-foreground">{klaim.tagline}</p>
            )}
            <ul className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
              {klaim.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <Check
                    className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600"
                    aria-hidden
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 shrink-0 md:mt-0 md:text-right">
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatRupiah(klaim.price_monthly)}
            </div>
            {klaim.price_note && (
              <p className="text-xs text-muted-foreground">{klaim.price_note}</p>
            )}
            {klaim.cta_href && klaim.cta_label && (
              <a
                href={klaim.cta_href}
                target={klaim.cta_href.startsWith('http') ? '_blank' : undefined}
                rel={klaim.cta_href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="mt-3 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {klaim.cta_label}
              </a>
            )}
          </div>
        </div>
      )}

    </>
  );
}
