import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { InfluencerForm } from '@/components/admin/InfluencerForm';

export const dynamic = 'force-dynamic';

export default function NewInfluencerPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/influencers"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Semua Influencer
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Tambah Influencer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Isi profil content creator yang akan tampil di direktori publik.
        </p>
      </div>

      <InfluencerForm mode="create" />
    </div>
  );
}
