import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Medhour Pharmacy collects, uses and protects your personal information — including account details, orders and prescriptions — when you shop with us online or in store.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <ProsePage
      title="Privacy Policy"
      intro={`This policy explains what information ${SITE.name} collects, why we collect it and how we keep it safe.`}
    >
      <p className="text-sm text-ink/50">Last updated: July 2026</p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — when you create an account, we collect your name,
          email address and/or phone number.
        </li>
        <li>
          <strong>Order information</strong> — the products you order, your delivery or pickup
          details, and your payment method choice.
        </li>
        <li>
          <strong>Prescription information</strong> — prescriptions you upload so our pharmacist
          can review them and dispense your medicines safely.
        </li>
        <li>
          <strong>Communication</strong> — messages you send us through the contact form, email,
          phone or WhatsApp.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To process and deliver your orders, or prepare them for pickup.</li>
        <li>To review prescriptions and dispense medicines safely and legally.</li>
        <li>To contact you about your orders, prescriptions or enquiries.</li>
        <li>To manage your account and improve our service.</li>
        <li>To meet legal and regulatory obligations that apply to pharmacies in Tanzania.</li>
      </ul>

      <h2>How your information is stored</h2>
      <p>
        Our website data is stored securely using Supabase, a hosted database platform with
        encryption and access controls. Access to personal information is limited to the staff who
        need it to serve you.
      </p>

      <h2>Prescription confidentiality</h2>
      <p>
        Prescriptions you upload are treated as confidential health information. They are reviewed
        only by our pharmacist and authorised pharmacy staff, and are used solely to dispense your
        medicines safely. We do not use prescription information for marketing.
      </p>

      <h2>We do not sell your data</h2>
      <p>
        We do not sell, rent or trade your personal information to third parties. We only share
        information where it is necessary to fulfil your order (for example, with a delivery
        rider) or where the law requires it.
      </p>

      <h2>Your rights and requests</h2>
      <p>
        You may ask us to access, correct or delete the personal information we hold about you,
        subject to any records we are legally required to keep as a pharmacy. To make a request,
        contact us at <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The latest version will always be published
        on this page. Questions? Visit our <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
