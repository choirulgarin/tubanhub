import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Hasil pengecekan admin — dipakai di layout & API routes.
export type AdminCheck =
  | { ok: true; userId: string; email: string | null }
  | { ok: false; reason: 'unauthenticated' | 'not_admin' };

// Cek apakah request datang dari user Supabase yang juga tercatat di tabel admin_users.
// Query admin_users pakai service role (bypass RLS) — user-side client hanya dipakai
// untuk membaca session cookie yang sudah ter-refresh oleh middleware.
export async function getAdmin(): Promise<AdminCheck> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: 'unauthenticated' };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('admin_users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: 'not_admin' };
  }

  return { ok: true, userId: user.id, email: user.email ?? null };
}
