import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://tubanhub.id'
).replace(/\/$/, '');

// Sitemap dinamis — menggabungkan route statis + detail item published + kategori aktif.
// Memakai service role client karena sitemap.ts dijalankan di luar request scope
// (tidak punya akses cookies).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${APP_URL}/tentang`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${APP_URL}/usul`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${APP_URL}/pengumuman`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/pemerintah`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${APP_URL}/pasang-iklan`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const supabase = createAdminClient();

  // Kategori aktif — prioritas 0.8 (hub navigasi utama).
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .eq('is_active', true);

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map(
    (c: { slug: string; created_at: string }) => ({
      url: `${APP_URL}/${c.slug}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }),
  );

  // Item published — prioritas 0.6. Join ke kategori untuk menyusun URL.
  const { data: items } = await supabase
    .from('items')
    .select('slug, updated_at, category:categories!inner(slug)')
    .eq('is_published', true);

  type ItemRow = {
    slug: string;
    updated_at: string;
    category:
      | { slug: string }
      | Array<{ slug: string }>
      | null;
  };
  const itemEntries: MetadataRoute.Sitemap = (
    (items ?? []) as unknown as ItemRow[]
  )
    .map((r) => {
      const cat = Array.isArray(r.category) ? r.category[0] : r.category;
      if (!cat?.slug) return null;
      return {
        url: `${APP_URL}/${cat.slug}/${r.slug}`,
        lastModified: new Date(r.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // Pengumuman aktif (published & belum expired).
  const nowIso = new Date().toISOString();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, updated_at, expires_at')
    .eq('is_published', true);

  const announcementEntries: MetadataRoute.Sitemap = (announcements ?? [])
    .filter(
      (a: { expires_at: string | null }) =>
        !a.expires_at || a.expires_at > nowIso,
    )
    .map((a: { id: string; updated_at: string }) => ({
      url: `${APP_URL}/pengumuman/${a.id}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

  return [
    ...staticEntries,
    ...categoryEntries,
    ...itemEntries,
    ...announcementEntries,
  ];
}
