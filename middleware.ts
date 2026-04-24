import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Middleware Next.js — berjalan di semua request (lihat `matcher` di bawah).
// Tugas: (1) refresh session Supabase, (2) proteksi route /admin.
export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Route admin yang perlu diproteksi. /admin/login dikecualikan agar user bisa login.
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute && !user) {
    // Belum login → redirect ke halaman login admin.
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Jika sudah login dan mengakses /admin/login, arahkan ke dashboard.
  if (isLoginRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/admin/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Jalankan middleware di semua path kecuali asset statis & file Next.js internal.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
