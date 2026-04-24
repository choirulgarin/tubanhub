import Link from 'next/link';
import { Users, PlusCircle, BadgeCheck, Sparkles } from 'lucide-react';
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
import { InfluencerRowActions } from '@/components/admin/InfluencerRowActions';
import type { Influencer } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminInfluencersPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('influencers')
    .select('*')
    .order('highlight_tier', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/influencers]', error.message);
  }
  const rows = (data ?? []) as Influencer[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Direktori Influencer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola profil content creator lokal Tuban.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/influencers/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Influencer Baru
          </Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada influencer"
          description="Tambahkan profil influencer pertama untuk mengisi direktori."
          action={{ label: 'Tambah Influencer', href: '/admin/influencers/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Niche</TableHead>
                <TableHead className="hidden lg:table-cell">Platform</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[260px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inf) => (
                <TableRow key={inf.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground">{inf.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {inf.location ?? inf.district ?? '—'}
                        </p>
                      </div>
                      {inf.is_verified && (
                        <BadgeCheck
                          className="h-4 w-4 shrink-0 text-blue-600"
                          aria-label="Verified"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {inf.niches.slice(0, 3).join(', ') || '—'}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {inf.platforms.length} platform
                  </TableCell>
                  <TableCell>
                    {inf.highlight_tier === 'featured' ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                        Featured
                      </Badge>
                    ) : inf.highlight_tier === 'highlight' ? (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        Unggulan
                      </Badge>
                    ) : inf.highlight_tier === 'basic' ? (
                      <Badge variant="secondary">Basic</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {inf.is_published ? (
                      <Badge variant="secondary">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <InfluencerRowActions influencer={inf} />
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
