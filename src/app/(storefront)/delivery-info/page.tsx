import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Delivery Information",
  description:
    "Medhour Pharmacy delivers within Dar es Salaam and offers store pickup at Benjamin Tower, Azikiwe Street, Posta. Delivery timing and fees are confirmed when your order is processed.",
  alternates: { canonical: "/delivery-info" },
};

export default function DeliveryInfoPage() {
  return (
    <ProsePage
      title="Delivery Information"
      intro="How we get your order to you — delivery within Dar es Salaam or pickup at our Posta store."
    >
      <h2>Delivery within Dar es Salaam</h2>
      <p>
        We deliver orders within Dar es Salaam. Delivery timing depends on when your order is
        placed and processed — we do not promise fixed delivery windows. Once your order has been
        reviewed and prepared, our team will contact you to confirm the delivery arrangements.
      </p>
      <p>
        A delivery fee applies and is confirmed at checkout before you place your order, so there
        are no surprises.
      </p>

      <h2>Store pickup</h2>
      <p>
        Prefer to collect your order yourself? Choose store pickup at checkout and visit us at:
      </p>
      <div className="mt-4 rounded-2xl bg-surface p-5">
        <address className="not-italic leading-relaxed text-ink/80">
          <strong>{SITE.address.name}</strong>
          <br />
          {SITE.address.building}
          <br />
          {SITE.address.street}
          <br />
          {SITE.address.city}, {SITE.address.country}
        </address>
        <p className="!mt-3 text-sm text-ink/60">
          <span className="font-medium text-ink">Opening hours:</span> {SITE.openingHours}
        </p>
        <a
          href={SITE.mapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="!mt-3 inline-block text-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark"
        >
          Get directions
        </a>
      </div>

      <h2>How we pack and handle your order</h2>
      <ul>
        <li>Every order is checked against your order details before it leaves the pharmacy.</li>
        <li>
          Items are packed securely and discreetly, so your order arrives in good condition.
        </li>
        <li>
          Prescription medicines are only packed after our pharmacist has reviewed and approved
          your prescription.
        </li>
        <li>
          Products that need special handling are packed with appropriate care to maintain their
          quality.
        </li>
      </ul>

      <h2>Questions about your delivery?</h2>
      <p>
        Track your order on the <Link href="/track-order">track order</Link> page, or{" "}
        <Link href="/contact">contact us</Link> and we will be happy to help.
      </p>
    </ProsePage>
  );
}
