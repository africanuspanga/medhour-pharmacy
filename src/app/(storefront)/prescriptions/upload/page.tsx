import type { Metadata } from "next";
import { PrescriptionUploadForm } from "@/components/prescriptions/upload-form";

export const metadata: Metadata = {
  title: "Upload Prescription",
  description:
    "Upload your prescription (JPG, PNG or PDF) to Medhour Pharmacy. A licensed pharmacist reviews every prescription and contacts you to confirm your order.",
};

export default function PrescriptionUploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-bold text-ink sm:text-3xl">Upload your prescription</h1>
      <div className="mt-3 space-y-2 text-sm text-ink/60">
        <p>
          Send us a clear photo or scan of your prescription and we&apos;ll prepare your medicines
          for delivery or pickup. You don&apos;t need an account — just your phone number.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Accepted formats: JPG, PNG or PDF, up to 10 MB.</li>
          <li>A licensed pharmacist reviews every prescription before dispensing.</li>
          <li>We&apos;ll call or message you to confirm availability and price.</li>
        </ul>
      </div>
      <div className="mt-8">
        <PrescriptionUploadForm />
      </div>
    </div>
  );
}
