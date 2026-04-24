// Type definitions untuk data domain TubanHub.
// Mengikuti schema di supabase/schema.sql.

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;              // nama icon lucide, contoh: "map-pin"
  color: string | null;             // hex warna kategori, contoh: "#2563EB"
  order_index: number;
  is_active: boolean;
  created_at: string;
};

// Opening hours fleksibel — key umumnya nama hari dalam bhs Indonesia (senin..minggu)
// atau "24 jam" dengan nilai string jam buka.
export type OpeningHours = Record<string, string>;

// Metadata fleksibel per kategori (syarat dokumen, harga tiket, tips, dll.)
export type ItemMetadata = Record<string, unknown>;

export type Item = {
  id: string;
  category_id: string;
  subcategory: string | null;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  tags: string[];
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  district: string | null;
  gmaps_url: string | null;
  lat: number | null;
  lng: number | null;
  opening_hours: OpeningHours;
  images: string[];
  thumbnail_url: string | null;
  metadata: ItemMetadata;
  is_published: boolean;
  is_verified: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

// Item yang sudah di-enrich dengan info kategori — dipakai di card & search.
export type ItemWithCategory = Item & {
  category?: Pick<Category, 'name' | 'slug' | 'color' | 'icon'> | null;
};

// Shape hasil dari RPC search_items().
export type SearchResult = {
  id: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  category_color: string | null;
  category_icon: string | null;
  subcategory: string | null;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  address: string | null;
  district: string | null;
  tags: string[];
  is_verified: boolean;
  rank: number;
};
