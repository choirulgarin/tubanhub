import {
  Building2,
  MapPin,
  Utensils,
  Wrench,
  Search,
  FileText,
  CheckCircle,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

// Map nama icon (string di DB) → komponen LucideIcon.
// Tambahkan entry baru di sini saat kategori baru dibuat.
const ICON_MAP: Record<string, LucideIcon> = {
  'building-2': Building2,
  'map-pin': MapPin,
  utensils: Utensils,
  wrench: Wrench,
  search: Search,
  'file-text': FileText,
  'check-circle': CheckCircle,
  smartphone: Smartphone,
};

// Ambil komponen icon dari nama. Fallback ke MapPin agar UI tidak patah
// kalau ada nilai tak dikenal dari DB.
export function getIcon(name?: string | null): LucideIcon {
  if (!name) return MapPin;
  return ICON_MAP[name.toLowerCase()] ?? MapPin;
}
