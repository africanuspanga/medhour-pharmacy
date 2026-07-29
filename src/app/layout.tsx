import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Pharmacy in Posta, Dar es Salaam`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "pharmacy in Dar es Salaam",
    "pharmacy in Posta",
    "pharmacy Azikiwe Street",
    "online pharmacy Dar es Salaam",
    "medicine delivery Dar es Salaam",
  ],
  openGraph: {
    siteName: SITE.name,
    locale: "en_TZ",
    type: "website",
  },
  alternates: { canonical: "/" },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "Pharmacy",
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  telephone: SITE.phone,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.building}, ${SITE.address.street}`,
    addressLocality: SITE.address.city,
    addressCountry: "TZ",
  },
  openingHours: SITE.openingHours,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
