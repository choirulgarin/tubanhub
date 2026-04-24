// Generate slug URL-friendly dari judul bahasa Indonesia.
// - lowercase
// - ganti spasi & underscore jadi dash
// - hapus diakritik (mis. é → e) dan karakter non-alfanumerik
// - gabungkan dash beruntun
// - trim dash di ujung
export function generateSlug(title: string): string {
  if (!title) return '';

  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // hapus accent
    .toLowerCase()
    .replace(/&/g, ' dan ')
    .replace(/['"`’]/g, '') // apostrof tidak diganti dash
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80); // batasi panjang slug biar tetap rapih
}
