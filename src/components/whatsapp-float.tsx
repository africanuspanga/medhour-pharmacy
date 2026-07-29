import Image from "next/image";
import { WHATSAPP_URL } from "@/lib/constants";

/** Floating WhatsApp button shown on every page. */
export function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Medhour Pharmacy on WhatsApp"
      className="fixed bottom-5 left-5 z-40 block h-12 w-12 overflow-hidden rounded-full shadow-lg transition-transform hover:scale-105 sm:h-14 sm:w-14"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={56}
        height={56}
        className="h-full w-full object-cover"
      />
    </a>
  );
}
