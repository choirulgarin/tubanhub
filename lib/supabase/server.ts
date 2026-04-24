import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase client untuk Server Components, Route Handlers, dan Server Actions.
// Membaca/menulis cookie sesi via next/headers agar session user tetap sinkron.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Diabaikan: method `set` dipanggil dari Server Component.
            // Middleware sudah meng-handle refresh session, jadi aman untuk di-ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Sama seperti di atas — diabaikan di Server Component.
          }
        },
      },
    },
  );
}
