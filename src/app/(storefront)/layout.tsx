import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <MobileBottomNav />
    </>
  );
}
