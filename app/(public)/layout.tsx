import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

// Layout untuk semua halaman publik. Memasang Navbar + Footer serta komponen
// PWA yang hanya relevan untuk visitor. Dipisahkan dari root layout agar
// halaman /admin (yang punya shell-nya sendiri) tidak kejatuhan Footer publik.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <OfflineIndicator />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <InstallPrompt />
    </>
  );
}
