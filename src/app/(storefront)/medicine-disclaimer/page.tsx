import type { Metadata } from "next";
import Link from "next/link";
import { MEDICINE_DISCLAIMER, SITE } from "@/lib/constants";
import { ProsePage } from "@/components/static/prose-page";

export const metadata: Metadata = {
  title: "Medicine Disclaimer",
  description:
    "Important disclaimer about the medicine information on the Medhour Pharmacy website — it is for general reference only and is not a substitute for professional medical advice.",
  alternates: { canonical: "/medicine-disclaimer" },
};

export default function MedicineDisclaimerPage() {
  return (
    <ProsePage title="Medicine Disclaimer" intro="Please read this important notice about the health and medicine information on our website.">
      <div className="rounded-2xl border-2 border-brand bg-brand-light p-6">
        <p className="!mt-0 text-base font-semibold leading-relaxed text-brand-dark">
          {MEDICINE_DISCLAIMER}
        </p>
      </div>

      <h2>General reference only</h2>
      <p>
        The product descriptions, dosage information and other health-related content on this
        website are provided for general reference and educational purposes. They are not intended
        to diagnose, treat, cure or prevent any disease, and they may not reflect the most current
        medical information or the full information supplied by the manufacturer.
      </p>

      <h2>Not a substitute for professional advice</h2>
      <p>
        Nothing on this website replaces the advice of a qualified healthcare professional. Always
        consult a doctor or our pharmacist before starting, stopping or changing any medicine —
        especially if you are pregnant or breastfeeding, managing a chronic condition, or taking
        other medicines that could interact.
      </p>

      <h2>Read the label</h2>
      <p>
        Always read the label, packaging and patient information leaflet supplied with your
        medicine before use, and follow the directions of your prescriber or pharmacist. Do not
        exceed the recommended dose.
      </p>

      <h2>In an emergency</h2>
      <p>
        If you or someone else is experiencing a medical emergency — such as severe allergic
        reaction, difficulty breathing, poisoning or overdose — seek immediate medical attention
        at the nearest hospital or emergency service. Do not rely on this website or wait for an
        online response.
      </p>

      <h2>Talk to us</h2>
      <p>
        Our pharmacist is available during opening hours at {SITE.address.building},{" "}
        {SITE.address.street}, {SITE.address.city}, or by phone on {SITE.phone}. You can also{" "}
        <Link href="/contact">contact us online</Link> with any questions about your medicines.
      </p>
    </ProsePage>
  );
}
