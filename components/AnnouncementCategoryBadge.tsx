import { cn } from '@/lib/utils';
import type { AnnouncementCategory } from '@/types';

export const ANNOUNCEMENT_CATEGORY_LABEL: Record<AnnouncementCategory, string> =
  {
    umum: 'Umum',
    bencana: 'Bencana',
    kesehatan: 'Kesehatan',
    infrastruktur: 'Infrastruktur',
    event: 'Event',
  };

// Warna per kategori — pakai token tailwind supaya tetap konsisten dark/light.
const CATEGORY_CLASS: Record<AnnouncementCategory, string> = {
  umum: 'bg-slate-100 text-slate-700',
  bencana: 'bg-red-100 text-red-800',
  kesehatan: 'bg-emerald-100 text-emerald-800',
  infrastruktur: 'bg-blue-100 text-blue-800',
  event: 'bg-violet-100 text-violet-800',
};

export function AnnouncementCategoryBadge({
  category,
  className,
}: {
  category: AnnouncementCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        CATEGORY_CLASS[category],
        className,
      )}
    >
      {ANNOUNCEMENT_CATEGORY_LABEL[category]}
    </span>
  );
}
