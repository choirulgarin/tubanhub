import { ClipboardList } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils/format';
import type { ClaimRequest } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminClaimsPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('claim_requests')
    .select('*')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[admin/claims]', error.message);
  }
  const rows = (data ?? []) as ClaimRequest[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Pengajuan Klaim
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daftar pengajuan klaim listing dari pemilik bisnis/profil.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Belum ada pengajuan"
          description="Pengajuan klaim akan muncul di sini saat ada yang submit form /klaim."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Pemilik</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead className="hidden lg:table-cell">Bukti</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Dikirim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">
                    {r.listing_name}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {r.listing_type}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.owner_name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.contact_wa && <div>WA: {r.contact_wa}</div>}
                    {r.contact_email && <div>{r.contact_email}</div>}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {r.proof_url ? (
                      <a
                        href={r.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Lihat bukti
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.status === 'approved' ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-600">
                        Approved
                      </Badge>
                    ) : r.status === 'rejected' ? (
                      <Badge variant="outline">Rejected</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                    {formatDate(r.created_at)}
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
