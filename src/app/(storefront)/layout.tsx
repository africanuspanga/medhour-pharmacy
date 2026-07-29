import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
