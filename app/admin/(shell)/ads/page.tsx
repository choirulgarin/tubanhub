import Link from 'next/link';
import { Megaphone, PlusCircle } from 'lucide-react';
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
import { AdRowActions } from '@/components/admin/AdRowActions';
import { formatNumber, formatDate } from '@/lib/utils/format';
import type { Ad } from '@/types';

export const dynamic = 'force-dynamic';

const PLACEMENT_LABEL: Record<string, string> = {
  home_top: 'Beranda atas',
  home_bottom: 'Beranda bawah',
  category_top: 'Atas kategori',
  sidebar: 'Sidebar',
};

export default async function AdminAdsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ads')
    .select('*')
    .order('is_active', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/ads]', error.message);
  }
  const ads = (data ?? []) as Ad[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Iklan Lokal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola slot iklan UMKM dan layanan lokal Tuban.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/ads/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Iklan Baru
          </Link>
        </Button>
      </header>

      {ads.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada iklan"
          description="Mulai dengan membuat iklan pertama untuk slot beranda atau kategori."
          action={{ label: 'Buat Iklan', href: '/admin/ads/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Placement</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell text-right">
                  Views
                </TableHead>
                <TableHead className="hidden lg:table-cell text-right">
                  Clicks
                </TableHead>
                <TableHead className="hidden lg:table-cell">Berakhir</TableHead>
                <TableHead className="w-[220px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{ad.title}</p>
                      {ad.advertiser_name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {ad.advertiser_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {PLACEMENT_LABEL[ad.placement] ?? ad.placement}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {ad.category_slug ?? 'Semua'}
                  </TableCell>
                  <TableCell>
                    {ad.is_active ? (
                      <Badge variant="secondary">Aktif</Badge>
                    ) : (
                      <Badge variant="outline">Pause</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                    {formatNumber(ad.impressions ?? 0)}
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground lg:table-cell">
                    {formatNumber(ad.clicks ?? 0)}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {ad.ends_at ? formatDate(ad.ends_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <AdRowActions ad={ad} />
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
