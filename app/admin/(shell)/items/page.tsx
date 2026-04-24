import Link from 'next/link';
import Image from 'next/image';
import { Inbox, PlusCircle, MapPin } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCategories } from '@/lib/queries';
import { ItemsFilterBar } from '@/components/admin/ItemsFilterBar';
import { ItemRowActions } from '@/components/admin/ItemRowActions';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: {
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  };
};

const PAGE_SIZE = 20;

type AdminItemRow = {
  id: string;
  title: string;
  slug: string;
  subcategory: string | null;
  is_published: boolean;
  is_verified: boolean;
  view_count: number | null;
  thumbnail_url: string | null;
  updated_at: string;
  category: { id: string; name: string; slug: string; color: string | null } | null;
};

async function loadItems(params: PageProps['searchParams']) {
  const q = params.q?.trim() ?? '';
  const status =
    params.status === 'published' || params.status === 'draft'
      ? params.status
      : null;
  const categorySlug = params.category ?? '';
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  const supabase = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const baseCols =
    'id, title, slug, subcategory, is_published, is_verified, view_count, thumbnail_url, updated_at';

  let query = categorySlug
    ? supabase
        .from('items')
        .select(
          `${baseCols}, category:categories!inner(id, name, slug, color)`,
          { count: 'exact' },
        )
        .eq('category.slug', categorySlug)
    : supabase
        .from('items')
        .select(
          `${baseCols}, category:categories(id, name, slug, color)`,
          { count: 'exact' },
        );

  if (status === 'published') query = query.eq('is_published', true);
  if (status === 'draft') query = query.eq('is_published', false);
  if (q) query = query.ilike('title', `%${q}%`);

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.warn('[admin/items]', error.message);
    return { rows: [] as AdminItemRow[], total: 0, page };
  }

  const rows: AdminItemRow[] = ((data ?? []) as unknown as Array<
    Omit<AdminItemRow, 'category'> & {
      category:
        | { id: string; name: string; slug: string; color: string | null }
        | Array<{ id: string; name: string; slug: string; color: string | null }>
        | null;
    }
  >).map((r) => ({
    ...r,
    category: Array.isArray(r.category) ? r.category[0] ?? null : r.category,
  }));

  return { rows, total: count ?? 0, page };
}

export default async function AdminItemsPage({ searchParams }: PageProps) {
  const [categories, { rows, total, page }] = await Promise.all([
    getCategories(),
    loadItems(searchParams),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Kelola Item
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatNumber(total)} item total — kelola, publikasi, dan hapus.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/items/new">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Tambah Item Baru
          </Link>
        </Button>
      </header>

      <ItemsFilterBar categories={categories} />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Inbox
            className="h-8 w-8 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h3 className="mt-3 text-sm font-medium text-foreground">
            Tidak ada item yang cocok
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Coba longgarkan filter atau tambah item baru untuk mulai mengisi
            konten TubanHub.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Sub</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <AdminItemRowView key={row.id} row={row} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {rows.length > 0 && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

function AdminItemRowView({ row }: { row: AdminItemRow }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          {row.thumbnail_url ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={row.thumbnail_url}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            >
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {row.category?.name ?? '—'}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {row.subcategory ?? '—'}
      </TableCell>
      <TableCell>
        <StatusBadge published={row.is_published} />
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {formatNumber(row.view_count ?? 0)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(row.updated_at)}
      </TableCell>
      <TableCell>
        <ItemRowActions
          id={row.id}
          title={row.title}
          isPublished={row.is_published}
        />
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="secondary">Published</Badge>
  ) : (
    <Badge variant="outline">Draft</Badge>
  );
}

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: PageProps['searchParams'];
}) {
  function hrefFor(p: number) {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.status) params.set('status', searchParams.status);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `/admin/items?${qs}` : '/admin/items';
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          'rounded-md border border-border px-3 py-1.5 text-xs font-medium',
          page === 1
            ? 'pointer-events-none text-muted-foreground/40'
            : 'text-foreground hover:bg-muted',
        )}
      >
        ← Sebelumnya
      </Link>
      <span className="text-xs text-muted-foreground">
        Halaman{' '}
        <span className="font-medium text-foreground">{page}</span> dari{' '}
        <span className="font-medium text-foreground">{totalPages}</span>
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          'rounded-md border border-border px-3 py-1.5 text-xs font-medium',
          page === totalPages
            ? 'pointer-events-none text-muted-foreground/40'
            : 'text-foreground hover:bg-muted',
        )}
      >
        Selanjutnya →
      </Link>
    </nav>
  );
}
