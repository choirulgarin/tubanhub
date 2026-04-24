import Link from 'next/link';
import { Star, PlusCircle } from 'lucide-react';
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
import { HighlightRowActions } from '@/components/admin/HighlightRowActions';
import { formatDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

type HighlightRow = {
  id: string;
  listing_type: 'items' | 'influencer';
  listing_id: string;
  tier: 'basic' | 'highlight' | 'featured';
  category_slug: string | null;
  starts_at: string | null;
  expires_at: string;
  is_active: boolean;
  payment_ref: string | null;
  created_at: string;
};

const TIER_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  featured: 'default',
  highlight: 'secondary',
  basic: 'outline',
};

export default async function AdminHighlightsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('highlights')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/highlights]', error.message);
  }
  const rows = (data ?? []) as HighlightRow[];

  // Batch-fetch label listing untuk tampilan.
  const itemIds = rows.filter((r) => r.listing_type === 'items').map((r) => r.listing_id);
  const infIds = rows.filter((r) => r.listing_type === 'influencer').map((r) => r.listing_id);

  const labels: Record<string, string> = {};
  if (itemIds.length > 0) {
    const { data: items } = await admin
      .from('items')
      .select('id, title')
      .in('id', itemIds);
    (items ?? []).forEach((it) => {
      labels[`items:${it.id}`] = it.title;
    });
  }
  if (infIds.length > 0) {
    const { data: infs } = await admin
      .from('influencers')
      .select('id, name')
      .in('id', infIds);
    (infs ?? []).forEach((it) => {
      labels[`influencer:${it.id}`] = it.name;
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Highlights
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola listing bersponsor yang naik ke posisi atas.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/highlights/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Highlight Baru
          </Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Belum ada highlight"
          description="Aktifkan highlight pertama untuk menaikkan listing di grid."
          action={{ label: 'Buat Highlight', href: '/admin/highlights/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Mulai</TableHead>
                <TableHead className="hidden md:table-cell">Berakhir</TableHead>
                <TableHead className="hidden lg:table-cell">Payment</TableHead>
                <TableHead className="w-[200px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const key = `${row.listing_type}:${row.listing_id}`;
                const label = labels[key] ?? row.listing_id.slice(0, 8);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">{label}</p>
                      {row.category_slug && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          /{row.category_slug}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.listing_type === 'items' ? 'Item' : 'Influencer'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={TIER_VARIANT[row.tier] ?? 'outline'}>
                        {row.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.is_active ? (
                        <Badge variant="secondary">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Pause</Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {row.starts_at ? formatDate(row.starts_at) : '—'}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(row.expires_at)}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {row.payment_ref ?? '—'}
                    </TableCell>
                    <TableCell>
                      <HighlightRowActions
                        id={row.id}
                        isActive={row.is_active}
                        label={label}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
