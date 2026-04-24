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
  highlight_tier: HighlightTier;
  highlight_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

// Item yang sudah di-enrich dengan info kategori — dipakai di card & search.
export type ItemWithCategory = Item & {
  category?: Pick<Category, 'name' | 'slug' | 'color' | 'icon'> | null;
};

// Status review usulan dari publik.
export type SuggestionStatus = 'pending' | 'approved' | 'rejected';

export type Suggestion = {
  id: string;
  category: string | null;
  name: string;
  address: string | null;
  description: string | null;
  contact: string | null;
  submitted_by: string | null;
  submitted_contact: string | null;
  status: SuggestionStatus;
  notes: string | null;
  created_at: string;
};

// Pengumuman / berita penting untuk warga Tuban.
export type AnnouncementCategory =
  | 'umum'
  | 'bencana'
  | 'kesehatan'
  | 'infrastruktur'
  | 'event';

export type Announcement = {
  id: string;
  title: string;
  content: string | null;
  source: string | null;
  source_url: string | null;
  category: AnnouncementCategory;
  is_pinned: boolean;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

// Iklan lokal — slot untuk UMKM/tempat Tuban.
export type AdPlacement =
  | 'home_top'
  | 'home_bottom'
  | 'category_top'
  | 'sidebar';

export type Ad = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  advertiser_name: string | null;
  advertiser_contact: string | null;
  placement: AdPlacement;
  category_slug: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
};

// Influencer — direktori content creator lokal Tuban.
export type InfluencerPlatform = {
  platform: string; // instagram | tiktok | youtube | facebook | twitter
  username: string;
  followers: number;
  url: string;
};

export type ContentLanguage = 'indonesia' | 'jawa' | 'campur';

export type HighlightTier = 'none' | 'basic' | 'highlight' | 'featured';

export type Influencer = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
  location: string | null;
  district: string | null;
  platforms: InfluencerPlatform[];
  niches: string[];
  content_language: ContentLanguage;
  rate_min: number | null;
  rate_max: number | null;
  rate_notes: string | null;
  contact_wa: string | null;
  contact_email: string | null;
  contact_dm: string | null;
  is_verified: boolean;
  is_claimed: boolean;
  is_umkm_friendly: boolean;
  is_fast_response: boolean;
  highlight_tier: HighlightTier;
  highlight_expires_at: string | null;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ClaimListingType =
  | 'influencer'
  | 'wisata'
  | 'kuliner'
  | 'jasa'
  | 'birokrasi';

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export type ClaimRequest = {
  id: string;
  listing_type: ClaimListingType;
  listing_name: string;
  owner_name: string;
  proof_url: string | null;
  contact_wa: string | null;
  contact_email: string | null;
  status: ClaimStatus;
  notes: string | null;
  created_at: string;
};

// Pricing — konfigurasi paket harga publik, dieditabel via admin.
export type PricingTierKey =
  | 'free'
  | 'basic'
  | 'highlight'
  | 'featured'
  | 'klaim'
  | string;

export type PricingConfig = {
  id: string;
  tier_key: PricingTierKey;
  tier_label: string;
  tagline: string | null;
  price_monthly: number;
  price_yearly: number;
  price_note: string | null;
  features: string[];
  cta_label: string | null;
  cta_href: string | null;
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

// Komunitas — direktori komunitas lokal Tuban.
export type CommunityCategory =
  | 'olahraga'
  | 'seni-budaya'
  | 'bisnis-umkm'
  | 'sosial-lingkungan'
  | 'teknologi-kreatif'
  | 'pendidikan'
  | 'hobi'
  | 'keagamaan'
  | 'umum';

export type Community = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  category: CommunityCategory;
  logo_url: string | null;
  cover_url: string | null;
  website: string | null;
  contact_wa: string | null;
  contact_email: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  whatsapp_group: string | null;
  telegram_group: string | null;
  area: string | null;
  district: string | null;
  meeting_place: string | null;
  meeting_schedule: string | null;
  member_count: number;
  founded_year: number | null;
  is_verified: boolean;
  is_claimed: boolean;
  is_open: boolean;
  tags: string[];
  highlight_tier: HighlightTier;
  highlight_expires_at: string | null;
  view_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

// Event — agenda kegiatan publik di Tuban.
export type EventCategory =
  | 'umum'
  | 'olahraga'
  | 'bisnis'
  | 'sosial'
  | 'seni-budaya'
  | 'keagamaan'
  | 'pendidikan'
  | 'teknologi';

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  content: string | null;
  category: EventCategory;
  cover_url: string | null;
  community_id: string | null;
  organizer_name: string | null;
  organizer_contact: string | null;
  start_date: string;
  end_date: string | null;
  location_name: string | null;
  location_address: string | null;
  district: string | null;
  gmaps_url: string | null;
  is_online: boolean;
  online_url: string | null;
  ticket_price: number;
  ticket_note: string | null;
  registration_url: string | null;
  registration_deadline: string | null;
  max_attendees: number | null;
  current_attendees: number;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type EventWithCommunity = EventItem & {
  community?: Pick<Community, 'id' | 'name' | 'slug' | 'logo_url'> | null;
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
