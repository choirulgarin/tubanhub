import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { AnnouncementForm } from '@/components/admin/AnnouncementForm';
import type { Announcement } from '@/types';

export const dynamic = 'force-dynamic';

type PageProps = { params: { id: string } };

export default async function AdminEditAnnouncementPage({
  params,
}: PageProps) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('announcements')
    .select('*')
    .eq('id', params.id)
    .maybeSingle<Announcement>();

  if (!data) notFound();

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
          Edit Pengumuman
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.title}</p>
      </header>

      <AnnouncementForm mode="edit" initial={data} />
    </div>
  );
}
