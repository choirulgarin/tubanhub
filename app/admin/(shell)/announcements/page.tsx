import Link from 'next/link';
import { Megaphone, PlusCircle, Pin } from 'lucide-react';
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
import { formatDateTime } from '@/lib/utils/format';
import { AnnouncementRowActions } from '@/components/admin/AnnouncementRowActions';
import {
  AnnouncementCategoryBadge,
  ANNOUNCEMENT_CATEGORY_LABEL,
} from '@/components/AnnouncementCategoryBadge';
import type { Announcement } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/announcements]', error.message);
  }
  const items = (data ?? []) as Announcement[];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Pengumuman & Berita
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola pengumuman publik, banner, dan info penting untuk warga Tuban.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/announcements/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Pengumuman Baru
          </Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Belum ada pengumuman"
          description="Mulai bikin pengumuman pertama — bisa soal bencana, event, atau imbauan kesehatan."
          action={{
            label: 'Buat Pengumuman',
            href: '/admin/announcements/new',
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Publikasi</TableHead>
                <TableHead className="hidden lg:table-cell">Expires</TableHead>
                <TableHead className="w-[220px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {a.is_pinned && (
                        <Pin
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                          aria-label="Di-pin"
                        />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{a.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {a.source ?? ANNOUNCEMENT_CATEGORY_LABEL[a.category]}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AnnouncementCategoryBadge category={a.category} />
                  </TableCell>
                  <TableCell>
                    {a.is_published ? (
                      <Badge variant="secondary">Published</Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {a.published_at ? formatDateTime(a.published_at) : '—'}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {a.expires_at ? formatDateTime(a.expires_at) : '—'}
                  </TableCell>
                  <TableCell>
                    <AnnouncementRowActions announcement={a} />
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
