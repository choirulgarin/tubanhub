import Link from 'next/link';
import { Tag, Pencil } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PricingConfig } from '@/types';

export const dynamic = 'force-dynamic';

function formatRupiah(n: number): string {
  if (n === 0) return 'Gratis';
  return `Rp ${new Intl.NumberFormat('id-ID').format(n)}`;
}

export default async function AdminPricingPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('pricing_config')
    .select('*')
    .order('order_index', { ascending: true });

  if (error) {
    console.warn('[admin/pricing]', error.message);
  }
  const tiers = (data ?? []) as PricingConfig[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Paket Harga
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola tier & harga yang tampil di halaman{' '}
          <Link href="/harga" className="underline hover:text-foreground">
            /harga
          </Link>
          . Seed awal lewat migration{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            009_pricing.sql
          </code>
          .
        </p>
      </header>

      {tiers.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Belum ada paket"
          description="Jalankan migration 009_pricing.sql untuk menginisialisasi seed tier."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Bulanan</TableHead>
                <TableHead>Tahunan</TableHead>
                <TableHead className="hidden md:table-cell">Fitur</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {t.tier_label}
                      </p>
                      {t.is_featured && (
                        <Badge variant="default">Populer</Badge>
                      )}
                    </div>
                    {t.tagline && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t.tagline}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {t.tier_key}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRupiah(t.price_monthly)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatRupiah(t.price_yearly)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {t.features.length} fitur
                  </TableCell>
                  <TableCell>
                    {t.is_active ? (
                      <Badge variant="secondary">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/pricing/${t.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
