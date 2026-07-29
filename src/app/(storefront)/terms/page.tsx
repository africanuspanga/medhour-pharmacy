import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of the Medhour Pharmacy website and purchases from our pharmacy in Posta, Dar es Salaam, Tanzania.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ProsePage
      title="Terms & Conditions"
      intro={`These terms govern your use of the ${SITE.name} website and any purchases you make with us. By using this site, you accept these terms.`}
    >
      <p className="text-sm text-ink/50">Last updated: July 2026</p>

      <h2>Use of this website</h2>
      <p>
        This website is operated by {SITE.name}, located at {SITE.address.building},{" "}
        {SITE.address.street}, {SITE.address.city}, Tanzania. You may use this site to browse our
        products, place orders and manage your account, provided you do so lawfully and in
        accordance with these terms.
      </p>

      <h2>Product information</h2>
      <p>
        We work hard to keep product descriptions, images, prices and stock information accurate,
        but errors can occur and information may change. Product information on this site is for
        general reference and does not replace the advice of a qualified healthcare professional.
        Always read the label and leaflet supplied with any medicine.
      </p>

      <h2>Prescription-required products</h2>
      <p>
        Products marked as requiring a prescription can only be supplied against a valid
        prescription issued by a licensed prescriber. Every prescription is reviewed by our
        pharmacist, and dispensing is subject to the pharmacist&apos;s professional approval. We
        reserve the right to decline to dispense where a prescription is invalid, unclear or where
        supply would not be appropriate.
      </p>

      <h2>Pricing and payment</h2>
      <p>
        All prices are shown in Tanzanian Shillings (TZS) and may change without notice. The price
        confirmed at checkout is the price you pay for that order. Payment is made cash on
        delivery, on pickup at our store, or by other methods we may make available and confirm to
        you.
      </p>

      <h2>Orders and acceptance</h2>
      <p>
        Placing an order on this website is an offer to purchase. Your order is accepted only when
        our team confirms it after review — for example, after stock is verified and, where
        applicable, your prescription is approved. We may decline or cancel an order, in which
        case any payment already made for items not supplied will be refunded.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, {SITE.name} is not liable for indirect or consequential
        losses arising from the use of this website or from products purchased, and nothing in
        these terms excludes liability that cannot be excluded under Tanzanian law. Medicines must
        be used as directed on the label and by your prescriber or pharmacist.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the United Republic of Tanzania, and any disputes
        are subject to the jurisdiction of the Tanzanian courts.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Reach us through our <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
