import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { PricingForm } from '@/components/admin/PricingForm';
import type { PricingConfig } from '@/types';

export const dynamic = 'force-dynamic';

export default async function EditPricingPage({
  params,
}: {
  params: { id: string };
}) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pricing_config')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !data) notFound();
  const tier = data as PricingConfig;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/pricing"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden />
          Kembali ke Paket Harga
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Edit paket: {tier.tier_label}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perubahan langsung tampil di halaman /harga setelah di-cache re-validate.
        </p>
      </div>

      <PricingForm tier={tier} />
    </div>
  );
}
