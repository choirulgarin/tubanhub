import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdmin } from '@/lib/auth/requireAdmin';
import { createAdminClient } from '@/lib/supabase/admin';

async function getPendingSuggestionCount(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from('suggestions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await getAdmin();
  if (!check.ok) {
    redirect('/admin/login');
  }

  const pendingSuggestions = await getPendingSuggestionCount();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        email={check.email}
        pendingSuggestions={pendingSuggestions}
      />
      <div className="md:pl-[220px]">
        <main className="px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
