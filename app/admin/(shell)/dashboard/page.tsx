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
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

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

  // Jalankan paralel — tiap query ringan & independen.
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

  // Hitung views + items per kategori dari satu set data.
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
      // Supabase kadang mengetik sebagai array, kadang object — normalkan.
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
  const maxPerCategory = Math.max(1, ...stats.perCategory.map((p) => p.count));

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Selamat datang di TubanHub Admin — ringkasan konten dan statistik.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/items/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            Tambah Item Baru
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Lihat Website
          </Link>
        </div>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Item"
          value={stats.total}
          icon={Database}
          tone="slate"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={Eye}
          tone="green"
        />
        <StatCard
          label="Draft"
          value={stats.draft}
          icon={EyeOff}
          tone="amber"
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews}
          icon={TrendingUp}
          tone="blue"
        />
      </section>

      {/* Per category */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card md:p-6">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 md:text-lg">
            Item per Kategori
          </h2>
          <span className="text-xs text-slate-500">
            {stats.totalCategories} kategori aktif
          </span>
        </header>

        {stats.perCategory.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada kategori aktif.</p>
        ) : (
          <ul className="space-y-3">
            {stats.perCategory.map(({ category, count }) => {
              const pct = Math.round((count / maxPerCategory) * 100);
              const color = category.color ?? '#2563EB';
              return (
                <li key={category.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">
                      {category.name}
                    </span>
                    <span className="text-slate-500">{count} item</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                      aria-hidden
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent items */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-slate-100 p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 md:text-lg">
            Item Terbaru
          </h2>
          <Link
            href="/admin/items"
            className="text-sm font-medium text-primary hover:underline"
          >
            Lihat semua →
          </Link>
        </header>

        {stats.recent.length === 0 ? (
          <p className="p-5 text-sm text-slate-500 md:p-6">
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-2.5 font-medium md:px-6">Judul</th>
                  <th className="px-5 py-2.5 font-medium md:px-6">Kategori</th>
                  <th className="px-5 py-2.5 font-medium md:px-6">Status</th>
                  <th className="px-5 py-2.5 font-medium md:px-6">Update</th>
                  <th className="px-5 py-2.5 md:px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recent.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-800 md:px-6">
                      {row.title}
                    </td>
                    <td className="px-5 py-3 text-slate-600 md:px-6">
                      {row.category_name ?? '—'}
                    </td>
                    <td className="px-5 py-3 md:px-6">
                      <StatusPill published={row.is_published} />
                    </td>
                    <td className="px-5 py-3 text-slate-600 md:px-6">
                      {formatDate(row.updated_at)}
                    </td>
                    <td className="px-5 py-3 text-right md:px-6">
                      <Link
                        href={`/admin/items/${row.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof Database;
  tone: 'slate' | 'green' | 'amber' | 'blue';
}) {
  const tones: Record<
    'slate' | 'green' | 'amber' | 'blue',
    { bg: string; text: string }
  > = {
    slate: { bg: 'bg-slate-100', text: 'text-slate-700' },
    green: { bg: 'bg-secondary/10', text: 'text-secondary' },
    amber: { bg: 'bg-accent/10', text: 'text-accent' },
    blue:  { bg: 'bg-primary/10', text: 'text-primary' },
  };
  const t = tones[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <span
          aria-hidden
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg',
            t.bg,
            t.text,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Draft
    </span>
  );
}
