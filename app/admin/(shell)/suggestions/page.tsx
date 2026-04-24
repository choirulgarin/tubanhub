import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/ui/EmptyState';
import { SuggestionActions } from '@/components/admin/SuggestionActions';
import { cn } from '@/lib/utils';
import type { Suggestion, SuggestionStatus } from '@/types';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: { status?: string };
};

const STATUS_TABS: Array<{ label: string; value?: SuggestionStatus }> = [
  { label: 'Semua' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function parseStatus(v?: string): SuggestionStatus | undefined {
  return v === 'pending' || v === 'approved' || v === 'rejected' ? v : undefined;
}

export default async function AdminSuggestionsPage({ searchParams }: PageProps) {
  const activeStatus = parseStatus(searchParams.status);

  const admin = createAdminClient();
  let query = admin
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });
  if (activeStatus) query = query.eq('status', activeStatus);

  const { data, error } = await query;
  if (error) {
    console.warn('[admin/suggestions]', error.message);
  }
  const suggestions = (data ?? []) as Suggestion[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Usulan Pengguna
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review usulan tempat/layanan dari publik. Approve akan membuat draft
          item otomatis.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Filter status"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 md:mx-0 md:px-0"
      >
        {STATUS_TABS.map((tab) => {
          const active =
            (tab.value ?? undefined) === activeStatus ||
            (!tab.value && !activeStatus);
          const href = tab.value
            ? `/admin/suggestions?status=${tab.value}`
            : '/admin/suggestions';
          return (
            <Link
              key={tab.label}
              href={href}
              role="tab"
              aria-selected={active}
              className={cn(
                'relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm transition-colors',
                active
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
                />
              )}
            </Link>
          );
        })}
      </div>

      {suggestions.length === 0 ? (
        <EmptyState
          icon={MessageSquarePlus}
          title="Belum ada usulan"
          description={
            activeStatus
              ? `Tidak ada usulan berstatus ${activeStatus}.`
              : 'Belum ada usulan masuk dari halaman Usulkan Tempat.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Alamat</TableHead>
                <TableHead className="hidden lg:table-cell">Kontak</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[220px] text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suggestions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.category ?? '—'}
                  </TableCell>
                  <TableCell className="hidden max-w-[240px] truncate text-muted-foreground md:table-cell">
                    {s.address ?? '—'}
                  </TableCell>
                  <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                    {[s.submitted_by, s.submitted_contact]
                      .filter(Boolean)
                      .join(' · ') ||
                      s.contact ||
                      '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(s.created_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell>
                    <SuggestionActions suggestion={s} />
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

function StatusBadge({ status }: { status: SuggestionStatus }) {
  if (status === 'approved') return <Badge variant="secondary">Approved</Badge>;
  if (status === 'rejected') return <Badge variant="outline">Rejected</Badge>;
  return <Badge>Pending</Badge>;
}
