import Link from 'next/link';
import { Inbox, PlusCircle, MapPin } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCategories } from '@/lib/queries';
import { ItemsFilterBar } from '@/components/admin/ItemsFilterBar';
import { ItemRowActions } from '@/components/admin/ItemRowActions';
import { formatDate, formatNumber } from '@/lib/utils/format';
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
  const status = params.status === 'published' || params.status === 'draft' ? params.status : null;
  const categorySlug = params.category ?? '';
  const page = Math.max(1, Number(params.page ?? '1') || 1);

  const supabase = createAdminClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Base SELECT. Saat ada filter kategori, pakai !inner join agar filter benar-benar membatasi.
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

  // Normalisasi kategori (kadang object, kadang array).
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Kelola Item
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatNumber(total)} item total — kelola, publikasi, dan hapus.
          </p>
        </div>
        <Link
          href="/admin/items/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          Tambah Item Baru
        </Link>
      </header>

      <ItemsFilterBar categories={categories} />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="h-6 w-6" aria-hidden />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Tidak ada item yang cocok
          </h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Coba longgarkan filter atau tambah item baru untuk mulai mengisi
            konten TubanHub.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Item</th>
                  <th className="px-4 py-2.5 font-medium">Kategori</th>
                  <th className="px-4 py-2.5 font-medium">Sub</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Views</th>
                  <th className="px-4 py-2.5 font-medium">Update</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <AdminItemRowView key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
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
  const color = row.category?.color ?? '#2563EB';
  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {row.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.thumbnail_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
              loading="lazy"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundImage: `linear-gradient(135deg, ${color}33, ${color}14)`,
              }}
            >
              <MapPin className="h-4 w-4" style={{ color }} aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {row.title}
            </p>
            <p className="truncate text-xs text-slate-500">{row.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-700">
        {row.category?.name ?? '—'}
      </td>
      <td className="px-4 py-3 text-slate-500">{row.subcategory ?? '—'}</td>
      <td className="px-4 py-3">
        <StatusPill published={row.is_published} />
      </td>
      <td className="px-4 py-3 text-right text-slate-700">
        {formatNumber(row.view_count ?? 0)}
      </td>
      <td className="px-4 py-3 text-slate-600">{formatDate(row.updated_at)}</td>
      <td className="px-4 py-3">
        <ItemRowActions
          id={row.id}
          title={row.title}
          isPublished={row.is_published}
        />
      </td>
    </tr>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Draft
    </span>
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

  // Render ringkas: prev, page X dari Y, next.
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-card"
    >
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          'rounded-lg border border-slate-200 px-3 py-1.5 font-medium',
          page === 1
            ? 'pointer-events-none text-slate-300'
            : 'text-slate-700 hover:bg-slate-50',
        )}
      >
        ← Sebelumnya
      </Link>
      <span className="text-slate-600">
        Halaman <span className="font-semibold text-slate-900">{page}</span> dari{' '}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </span>
      <Link
        href={hrefFor(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          'rounded-lg border border-slate-200 px-3 py-1.5 font-medium',
          page === totalPages
            ? 'pointer-events-none text-slate-300'
            : 'text-slate-700 hover:bg-slate-50',
        )}
      >
        Selanjutnya →
      </Link>
    </nav>
  );
}

