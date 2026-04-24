'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type event `beforeinstallprompt` belum masuk ke TS lib default.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'tubanhub:install-dismissed';

// Banner ajakan install PWA. Muncul di bawah layar saat browser fire
// event `beforeinstallprompt`. Hilang otomatis jika app sudah diinstall
// atau user sudah men-dismiss (disimpan di localStorage).
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Jika sudah di-dismiss sebelumnya, jangan munculkan lagi.
    if (typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1') {
      return;
    }

    // Jika sudah dalam standalone mode (sudah terinstall), skip.
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      // iOS Safari flag
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Jika app tiba-tiba terinstall, sembunyikan banner.
    const installedHandler = () => setVisible(false);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      setVisible(false);
    }
    setDeferred(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install TubanHub"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-4 md:left-auto md:right-4 md:mx-0"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <span className="text-lg font-semibold">T</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install TubanHub di HP kamu</p>
          <p className="text-xs text-muted-foreground">
            Akses lebih cepat, bisa dibuka dari layar utama.
          </p>

          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleInstall} className="gap-1">
              <Download className="h-4 w-4" />
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Nanti saja
            </Button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Tutup"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
