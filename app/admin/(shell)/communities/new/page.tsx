import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { CommunityForm } from '@/components/admin/CommunityForm';

export const dynamic = 'force-dynamic';

export default function NewCommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/communities"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Semua Komunitas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Tambah Komunitas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi profil komunitas yang akan tampil di direktori publik.
        </p>
      </div>

      <CommunityForm mode="create" />
    </div>
  );
}
