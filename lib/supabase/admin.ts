import { createClient } from '@supabase/supabase-js';

// Supabase admin client (service role) — bypass RLS.
// WAJIB dipakai HANYA di server (API routes / server actions), JANGAN pernah
// di-import dari Client Component karena service key tidak boleh bocor ke browser.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin env vars tidak lengkap.');
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
