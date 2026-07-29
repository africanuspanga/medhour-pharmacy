import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Medhour Pharmacy is a community pharmacy in Posta, Dar es Salaam, offering genuine healthcare products, prescription services and professional pharmacy support — in store and online.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Trust",
    description:
      "We stock genuine healthcare products sourced through reputable suppliers, and our pharmacists are available to answer your questions honestly.",
  },
  {
    title: "Care",
    description:
      "Every customer is treated with respect and confidentiality. We take the time to help you understand your medicines and wellness options.",
  },
  {
    title: "Convenience",
    description:
      "Shop online from anywhere in Dar es Salaam and choose delivery or pickup at our Benjamin Tower store — whatever suits your day.",
  },
];

export default function AboutPage() {
  return (
    <ProsePage
      title="About Medhour Pharmacy"
      intro="A community pharmacy in the heart of Posta, Dar es Salaam — serving you in store and online."
    >
      <h2>Who we are</h2>
      <p>
        Medhour Pharmacy is a community pharmacy located at {SITE.address.building},{" "}
        {SITE.address.street}, in {SITE.address.city}, Tanzania. We serve our neighbourhood in
        Posta and customers across Dar es Salaam, combining the personal service of a local
        pharmacy with the convenience of online ordering.
      </p>

      <h2>What we offer</h2>
      <ul>
        <li>
          <strong>Genuine healthcare products</strong> — medicines, personal-care essentials and
          everyday health products from reputable suppliers.
        </li>
        <li>
          <strong>Prescription services</strong> — upload your prescription online and our
          pharmacist will review it before your order is prepared.
        </li>
        <li>
          <strong>Wellness products</strong> — vitamins, supplements and self-care items to support
          your everyday health.
        </li>
        <li>
          <strong>Professional pharmacy support</strong> — qualified pharmacy staff available to
          advise you on the safe use of your medicines.
        </li>
      </ul>

      <h2>Our values</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {values.map((value) => (
          <div key={value.title} className="rounded-2xl bg-surface p-5">
            <h3 className="!mt-0 text-base font-semibold text-brand-dark">{value.title}</h3>
            <p className="!mt-2 text-sm leading-relaxed text-ink/70">{value.description}</p>
          </div>
        ))}
      </div>

      <h2>Visit us</h2>
      <p>
        You will find us at {SITE.address.building}, {SITE.address.street}, {SITE.address.city}.
        Our opening hours are {SITE.openingHours}. Prefer to shop from home? Browse our catalogue
        online and choose delivery within Dar es Salaam or pickup at the store.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Browse the shop
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full border border-brand px-6 py-3 text-base font-semibold text-brand transition-colors hover:bg-brand-light"
        >
          Contact us
        </Link>
      </div>
    </ProsePage>
  );
}
