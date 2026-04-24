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

  return [...staticEntries, ...categoryEntries, ...itemEntries];
}
