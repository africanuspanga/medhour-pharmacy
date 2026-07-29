import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about ordering, delivery in Dar es Salaam, store pickup at Benjamin Tower, prescription uploads, payments and returns at Medhour Pharmacy.",
  alternates: { canonical: "/faq" },
};

const faqs: { question: string; answer: React.ReactNode }[] = [
  {
    question: "How do I place an order?",
    answer: (
      <>
        Browse the <Link href="/shop">shop</Link>, add items to your cart and proceed to checkout.
        You will choose delivery or store pickup and confirm your contact details. Once your order
        is placed, our team reviews it and prepares it — you can follow its progress on the{" "}
        <Link href="/track-order">track order</Link> page.
      </>
    ),
  },
  {
    question: "Do you deliver within Dar es Salaam?",
    answer: (
      <>
        Yes, we deliver within Dar es Salaam. When your order is processed, our team confirms the
        delivery timing with you. The delivery fee is confirmed at checkout before you place your
        order. See our <Link href="/delivery-info">delivery information</Link> page for details.
      </>
    ),
  },
  {
    question: "Can I pick up my order at the store?",
    answer: (
      <>
        Yes. Choose store pickup at checkout and collect your order at {SITE.address.name},{" "}
        {SITE.address.building}, {SITE.address.street}, {SITE.address.city}. Our opening hours are{" "}
        {SITE.openingHours}.
      </>
    ),
  },
  {
    question: "How do I order prescription medicines?",
    answer: (
      <>
        Products that require a prescription are marked on the site. Upload a clear photo or scan
        of your valid prescription on the{" "}
        <Link href="/prescriptions/upload">prescription upload</Link> page (or during checkout).
        Our pharmacist reviews every prescription, and your order is only dispensed once it is
        approved.
      </>
    ),
  },
  {
    question: "What payment methods do you accept?",
    answer: (
      <>
        You can pay cash on delivery or pay when you pick up your order at the store. Mobile money
        payment is being rolled out — please confirm availability with our team when placing your
        order.
      </>
    ),
  },
  {
    question: "Can I return a product?",
    answer: (
      <>
        For safety reasons, medicines generally cannot be returned once dispensed. If an item
        arrives damaged or is not what you ordered, we will replace it or refund you. See our{" "}
        <Link href="/returns-refunds">returns &amp; refunds</Link> policy for details.
      </>
    ),
  },
  {
    question: "How do I speak to the pharmacist?",
    answer: (
      <>
        You can call us on {SITE.phone}, message us on WhatsApp, email {SITE.email}, or visit the
        pharmacy at {SITE.address.building}, {SITE.address.street}. Our pharmacist is available
        during opening hours to answer questions about your medicines.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ProsePage
      title="Frequently Asked Questions"
      intro="Quick answers about ordering, delivery, prescriptions and payments at Medhour Pharmacy."
    >
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-ink/10 bg-white open:bg-surface"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-semibold text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
              {faq.question}
              <svg
                className="h-5 w-5 shrink-0 text-ink/40 transition-transform group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-ink/70 [&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>

      <h2>Still have a question?</h2>
      <p>
        Visit our <Link href="/contact">contact page</Link> or message us on WhatsApp — we are happy
        to help.
      </p>
    </ProsePage>
  );
}
