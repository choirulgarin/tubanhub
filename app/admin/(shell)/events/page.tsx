import Link from 'next/link';
import { CalendarDays, PlusCircle, Sparkles } from 'lucide-react';
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
import { EventRowActions } from '@/components/admin/EventRowActions';
import { formatDateTime } from '@/lib/utils/format';
import type { EventItem } from '@/types';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  festival: 'Festival',
  konser: 'Konser',
  olahraga: 'Olahraga',
  workshop: 'Workshop',
  seminar: 'Seminar',
  pameran: 'Pameran',
  bazaar: 'Bazaar',
  lainnya: 'Lainnya',
};

export default async function AdminEventsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) {
    console.warn('[admin/events]', error.message);
  }
  const rows = (data ?? []) as EventItem[];
  const now = Date.now();

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Agenda Event
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola event dan kegiatan publik di Tuban.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/events/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Event Baru
          </Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Belum ada event"
          description="Tambahkan event pertama untuk mengisi agenda."
          action={{ label: 'Tambah Event', href: '/admin/events/new' }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="hidden lg:table-cell">Mulai</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[260px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => {
                const startMs = new Date(e.start_date).getTime();
                const isPast = Number.isFinite(startMs) && startMs < now;
                return (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {e.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {e.location_name ?? (e.is_online ? 'Online' : '—')}
                          </p>
                        </div>
                        {e.is_featured && (
                          <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                            <Sparkles className="mr-1 h-3 w-3" aria-hidden />
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {CATEGORY_LABEL[e.category] ?? e.category}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                      {formatDateTime(e.start_date)}
                    </TableCell>
                    <TableCell>
                      {isPast ? (
                        <Badge variant="outline">Lewat</Badge>
                      ) : (
                        <Badge variant="secondary">Mendatang</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {e.is_published ? (
                        <Badge variant="secondary">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <EventRowActions event={e} />
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
