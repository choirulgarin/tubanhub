import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { getAdmin } from '@/lib/auth/requireAdmin';

// Layout untuk semua halaman admin di dalam shell (dashboard, items, categories).
// Login page sengaja diletakkan di luar route group `(shell)` supaya tidak ikut
// mendapat sidebar.
export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const check = await getAdmin();
  if (!check.ok) {
    // Belum login / bukan admin → kembalikan ke login. Middleware sudah
    // meng-handle kasus belum login, ini jaring kedua untuk user yang authenticated
    // tapi tidak terdaftar di tabel admin_users.
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar email={check.email} />
      <div className="md:pl-60">
        <main className="px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
