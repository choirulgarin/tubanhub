'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { createClient } from '@/lib/supabase/client';

// Halaman login admin — di-mount sebagai /admin/login.
// Middleware akan redirect user yang sudah login langsung ke /admin/dashboard.
export default function AdminLoginPage() {
  // useSearchParams butuh Suspense boundary agar bisa di-prerender.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!email.trim()) return 'Email wajib diisi.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return 'Format email tidak valid.';
    if (password.length < 6) return 'Password minimal 6 karakter.';
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authErr) {
      // Pesan generik agar tidak bocorkan info "email ada / tidak".
      setError('Email atau password salah. Coba lagi.');
      setLoading(false);
      return;
    }

    // Refresh + redirect ke dashboard (middleware akan validasi lagi di server).
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-white to-secondary/10 px-4 py-12">
      {/* Tint aksen radial halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(60rem 40rem at 10% 10%, rgba(37,99,235,0.10), transparent), radial-gradient(45rem 30rem at 90% 90%, rgba(22,163,74,0.10), transparent)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo href={null} />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100 md:p-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            Masuk ke Admin Panel
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan akun administrator TubanHub untuk mengelola konten.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{error}</span>
              </div>
            )}

            <LabeledInput
              id="email"
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="email"
              value={email}
              onChange={(v) => setEmail(v)}
              placeholder="admin@tubanhub.id"
              required
            />

            <LabeledInput
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="••••••••"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <LogIn className="h-4 w-4" aria-hidden />
              )}
              {loading ? 'Memproses…' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Hanya untuk administrator TubanHub.
          <br />
          Butuh akses? Hubungi pengelola.
        </p>
      </div>
    </div>
  );
}

// --- subcomponents (private) ---

function LabeledInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <span className="relative block">
        <Icon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          {...rest}
        />
      </span>
    </label>
  );
}
