import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description:
    "Medhour Pharmacy's returns and refunds policy — why medicines generally cannot be returned once dispensed, and how we replace damaged or incorrect items.",
  alternates: { canonical: "/returns-refunds" },
};

export default function ReturnsRefundsPage() {
  return (
    <ProsePage
      title="Returns & Refunds"
      intro="How we handle returns, replacements and refunds at Medhour Pharmacy."
    >
      <h2>Medicines cannot generally be returned</h2>
      <p>
        For your safety, medicines and other dispensed healthcare products generally cannot be
        returned once they have left the pharmacy. Because storage conditions outside our control
        cannot be verified, returned medicines cannot be resold or re-dispensed. Please check your
        order carefully before completing your purchase, and ask our pharmacist if you are unsure
        about a product.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        If an item arrives damaged, or you receive something different from what you ordered, we
        will put it right. Contact us as soon as possible — ideally within 48 hours of receiving
        your order — and keep the item and its packaging. We will arrange a replacement or a
        refund, depending on the situation and your preference.
      </p>

      <h2>How to request a return or refund</h2>
      <ol>
        <li>
          Contact us with your order number — through our <Link href="/contact">contact page</Link>,
          by phone on {SITE.phone}, or on WhatsApp.
        </li>
        <li>Describe the issue and, if possible, share a photo of the item and packaging.</li>
        <li>
          Our team will confirm the next steps, including how the item should be returned or
          collected if needed.
        </li>
      </ol>

      <h2>Refund timing</h2>
      <p>
        Once a refund is approved, how quickly the money reaches you depends on your original
        payment method. Cash payments are typically refunded directly, while refunds through other
        channels may take longer depending on the provider. We will confirm the expected
        arrangement when your refund is approved.
      </p>

      <h2>Questions?</h2>
      <p>
        Visit us at {SITE.address.building}, {SITE.address.street}, {SITE.address.city}, or{" "}
        <Link href="/contact">contact us</Link> — we are happy to help.
      </p>
    </ProsePage>
  );
}
