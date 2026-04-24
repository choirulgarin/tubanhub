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
import { CommunityRowActions } from '@/components/admin/CommunityRowActions';
import { formatNumber } from '@/lib/utils/format';
import type { Community } from '@/types';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  olahraga: 'Olahraga',
  'seni-budaya': 'Seni & Budaya',
  'bisnis-umkm': 'Bisnis & UMKM',
  'sosial-lingkungan': 'Sosial & Lingkungan',
  'teknologi-kreatif': 'Teknologi & Kreatif',
  pendidikan: 'Pendidikan',
  hobi: 'Hobi',
  keagamaan: 'Keagamaan',
  umum: 'Umum',
};

export default async function AdminCommunitiesPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('communities')
    .select('*')
    .order('highlight_tier', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/communities]', error.message);
  }
  const rows = (data ?? []) as Community[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Direktori Komunitas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola komunitas lokal Tuban.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/communities/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Komunitas Baru
          </Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada komunitas"
          description="Tambahkan komunitas pertama untuk mengisi direktori."
          action={{ label: 'Tambah Komunitas', href: '/admin/communities/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="hidden lg:table-cell">Anggota</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[260px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground">{c.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.area ?? c.district ?? '—'}
                        </p>
                      </div>
                      {c.is_verified && (
                        <BadgeCheck
                          className="h-4 w-4 shrink-0 text-blue-600"
                          aria-label="Verified"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {CATEGORY_LABEL[c.category] ?? c.category}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                    {formatNumber(c.member_count)}
                  </TableCell>
                  <TableCell>
                    {c.highlight_tier === 'featured' ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                        Featured
                      </Badge>
                    ) : c.highlight_tier === 'highlight' ? (
                      <Badge className="bg-blue-600 text-white hover:bg-blue-600">
                        Unggulan
                      </Badge>
                    ) : c.highlight_tier === 'basic' ? (
                      <Badge variant="secondary">Basic</Badge>
                    ) : (
                      <Badge variant="outline">—</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.is_published ? (
                      <Badge variant="secondary">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <CommunityRowActions community={c} />
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
