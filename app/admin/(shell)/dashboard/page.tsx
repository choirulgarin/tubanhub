import Link from 'next/link';
import {
  Database,
  Eye,
  EyeOff,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Pencil,
  Users,
  Star,
  ClipboardList,
  Tag,
  Megaphone,
  Sparkles,
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
  totalInfluencers: number;
  publishedInfluencers: number;
  activeHighlights: number;
  pendingClaims: number;
  activePricing: number;
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

  const nowIso = new Date().toISOString();
  const [
    totalRes,
    publishedRes,
    draftRes,
    categoriesRes,
    itemsForStatsRes,
    recentRes,
    totalInfluencersRes,
    publishedInfluencersRes,
    activeHighlightsRes,
    pendingClaimsRes,
    activePricingRes,
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
    supabase.from('influencers').select('id', { count: 'exact', head: true }),
    supabase
      .from('influencers')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('highlights')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', nowIso),
    supabase
      .from('claim_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('pricing_config')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
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
    totalInfluencers: totalInfluencersRes.count ?? 0,
    publishedInfluencers: publishedInfluencersRes.count ?? 0,
    activeHighlights: activeHighlightsRes.count ?? 0,
    pendingClaims: pendingClaimsRes.count ?? 0,
    activePricing: activePricingRes.count ?? 0,
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

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Influencer Published"
          value={stats.publishedInfluencers}
          icon={Users}
          hint={`dari ${formatNumber(stats.totalInfluencers)} total`}
        />
        <StatCard
          label="Highlight Aktif"
          value={stats.activeHighlights}
          icon={Star}
        />
        <StatCard
          label="Klaim Pending"
          value={stats.pendingClaims}
          icon={ClipboardList}
        />
        <StatCard
          label="Paket Harga Aktif"
          value={stats.activePricing}
          icon={Tag}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Akses cepat</h2>
        </header>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <QuickLink
            href="/admin/influencers/new"
            label="Influencer baru"
            icon={Users}
          />
          <QuickLink
            href="/admin/highlights/new"
            label="Highlight baru"
            icon={Star}
          />
          <QuickLink
            href="/admin/claims"
            label="Review klaim"
            icon={ClipboardList}
            badge={stats.pendingClaims}
          />
          <QuickLink href="/admin/pricing" label="Paket harga" icon={Tag} />
          <QuickLink
            href="/admin/announcements"
            label="Pengumuman"
            icon={Megaphone}
          />
          <QuickLink href="/admin/ads" label="Iklan" icon={Sparkles} />
        </div>
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
  hint,
}: {
  label: string;
  value: number;
  icon: typeof Database;
  hint?: string;
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
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
  badge,
}: {
  href: string;
  label: string;
  icon: typeof Database;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      <Icon
        className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex-1 truncate">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="secondary">Published</Badge>
  ) : (
    <Badge variant="outline">Draft</Badge>
  );
}
