'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Tombol install PWA yang dipasang di section landing page.
// Listener beforeinstallprompt berdiri sendiri (tidak share state dengan
// InstallPrompt banner) karena event ini bisa didengar oleh beberapa listener.
export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah diinstall / dalam standalone mode.
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) setInstalled(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
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
    if (choice.outcome === 'accepted') setInstalled(true);
    setDeferred(null);
  }

  if (installed) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white">
        <Smartphone className="h-4 w-4" aria-hidden />
        Sudah terinstall di perangkatmu
      </div>
    );
  }

  // Browser/perangkat yang tidak support beforeinstallprompt (mis. Safari iOS):
  // tampilkan fallback dengan instruksi manual yang singkat.
  if (!deferred) {
    return (
      <div className="text-sm text-white/90">
        Buka menu browser → <span className="font-semibold">Add to Home Screen</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstall}
      size="lg"
      className="gap-2 bg-white text-primary hover:bg-white/90"
    >
      <Download className="h-4 w-4" aria-hidden />
      Install Sekarang
    </Button>
  );
}
