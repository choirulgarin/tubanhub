import Link from 'next/link';
import {
  Database,
  Eye,
  EyeOff,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
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
import type { Category } from '@/types';

export const dynamic = 'force-dynamic';

type DashboardStats = {
  total: number;
  published: number;
  draft: number;
  totalCategories: number;
  totalViews: number;
  perCategory: Array<{ category: Category; count: number }>;
  recent: Array<{
    id: string;
    title: string;
    updated_at: string;
    is_published: boolean;
    category_name: string | null;
  }>;
};

async function loadStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const [
    totalRes,
    publishedRes,
    draftRes,
    categoriesRes,
    itemsForStatsRes,
    recentRes,
  ] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact', head: true }),
    supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', false),
    supabase.from('categories').select('*').order('order_index'),
    supabase.from('items').select('category_id, view_count'),
    supabase
      .from('items')
      .select(
        'id, title, updated_at, is_published, category:categories(name)',
      )
      .order('updated_at', { ascending: false })
      .limit(5),
  ]);

  const categories: Category[] = (categoriesRes.data ?? []) as Category[];
  const rows =
    (itemsForStatsRes.data ?? []) as Array<{
      category_id: string;
      view_count: number | null;
    }>;

  const countsByCategory = new Map<string, number>();
  let totalViews = 0;
  for (const r of rows) {
    countsByCategory.set(
      r.category_id,
      (countsByCategory.get(r.category_id) ?? 0) + 1,
    );
    totalViews += r.view_count ?? 0;
  }
  const perCategory = categories.map((c) => ({
    category: c,
    count: countsByCategory.get(c.id) ?? 0,
  }));

  const recentRaw =
    (recentRes.data ?? []) as Array<{
      id: string;
      title: string;
      updated_at: string;
      is_published: boolean;
      category: { name: string } | { name: string }[] | null;
    }>;
  const recent = recentRaw.map((r) => ({
    id: r.id,
    title: r.title,
    updated_at: r.updated_at,
    is_published: r.is_published,
    category_name: Array.isArray(r.category)
      ? r.category[0]?.name ?? null
      : r.category?.name ?? null,
  }));

  return {
    total: totalRes.count ?? 0,
    published: publishedRes.count ?? 0,
    draft: draftRes.count ?? 0,
    totalCategories: categories.length,
    totalViews,
    perCategory,
    recent,
  };
}

export default async function AdminDashboardPage() {
  const stats = await loadStats();

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan konten dan statistik TubanHub.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/items/new">
              <PlusCircle className="h-4 w-4" aria-hidden />
              Tambah Item Baru
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Lihat Website
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Item" value={stats.total} icon={Database} />
        <StatCard label="Published" value={stats.published} icon={Eye} />
        <StatCard label="Draft" value={stats.draft} icon={EyeOff} />
        <StatCard
          label="Total Views"
          value={stats.totalViews}
          icon={TrendingUp}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">
            Item per Kategori
          </h2>
          <span className="text-xs text-muted-foreground">
            {stats.totalCategories} kategori
          </span>
        </header>

        {stats.perCategory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada kategori aktif.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.perCategory.map(({ category, count }) => (
              <li
                key={category.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <span className="text-foreground">{category.name}</span>
                <span className="font-medium text-muted-foreground">
                  {count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-sm font-medium text-foreground">Item Terbaru</h2>
          <Link
            href="/admin/items"
            className="text-xs font-medium text-primary hover:underline"
          >
            Lihat semua →
          </Link>
        </header>

        {stats.recent.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Belum ada item. Klik{' '}
            <Link
              href="/admin/items/new"
              className="font-medium text-primary hover:underline"
            >
              Tambah Item Baru
            </Link>{' '}
            untuk memulai.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recent.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-foreground">
                    {row.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.category_name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <StatusBadge published={row.is_published} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(row.updated_at)}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/items/${row.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Database;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="secondary">Published</Badge>
  ) : (
    <Badge variant="outline">Draft</Badge>
  );
}
