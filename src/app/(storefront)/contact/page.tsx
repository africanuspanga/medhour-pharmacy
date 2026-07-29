import type { Metadata } from "next";
import { SITE, WHATSAPP_URL } from "@/lib/constants";
import { ContactForm } from "@/components/static/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Medhour Pharmacy at Benjamin Tower, Azikiwe Street, Posta, Dar es Salaam. Call, email, WhatsApp or visit us — we're happy to help.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/60">
            Questions about a product, an order or a prescription? Reach out — our pharmacy team in
            Posta, Dar es Salaam is happy to help.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-surface p-6">
              <h2 className="text-lg font-semibold text-ink">Visit our pharmacy</h2>
              <address className="mt-3 not-italic leading-relaxed text-ink/70">
                {SITE.address.name}
                <br />
                {SITE.address.building}
                <br />
                {SITE.address.street}
                <br />
                {SITE.address.city}, {SITE.address.country}
              </address>
              <p className="mt-3 text-sm text-ink/60">
                <span className="font-medium text-ink">Opening hours:</span> {SITE.openingHours}
              </p>
              <a
                href={SITE.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
              >
                Get directions
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>

            <div className="rounded-2xl bg-surface p-6">
              <h2 className="text-lg font-semibold text-ink">Call, email or WhatsApp</h2>
              <ul className="mt-3 space-y-2 text-ink/70">
                <li>
                  <span className="font-medium text-ink">Phone:</span>{" "}
                  <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="text-brand underline underline-offset-2 hover:text-brand-dark">
                    {SITE.phone}
                  </a>
                </li>
                <li>
                  <span className="font-medium text-ink">Email:</span>{" "}
                  <a href={`mailto:${SITE.email}`} className="text-brand underline underline-offset-2 hover:text-brand-dark">
                    {SITE.email}
                  </a>
                </li>
              </ul>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.08 8.08 0 0 1-1.24-4.28c0-4.47 3.64-8.11 8.16-8.11 2.18 0 4.22.85 5.76 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.47-3.68 8.08-8.15 8.08Zm4.46-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.36-1.68-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.8-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05 0 1.21.88 2.37 1 2.53.12.16 1.72 2.63 4.18 3.69.58.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-ink/10 bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Send us a message</h2>
            <p className="mt-1 mb-5 text-sm text-ink/60">
              Fill in the form and we will respond as soon as we can.
            </p>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-ink/10">
          <iframe
            src={SITE.mapsEmbedUrl}
            title={`Map showing ${SITE.address.name}, ${SITE.address.building}, ${SITE.address.street}, ${SITE.address.city}`}
            className="h-80 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
