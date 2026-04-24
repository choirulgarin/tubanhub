import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';

export const dynamic = 'force-dynamic';

export default function AdminNewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/admin/announcements"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Kembali ke daftar pengumuman
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Pengumuman Baru
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi detail pengumuman. Draft bisa di-publish kapan saja.
        </p>
      </header>

      <AnnouncementForm mode="create" />
    </div>
  );
}
