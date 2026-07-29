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
      className="fixed bottom-24 right-4 z-40 block h-14 w-14 transition-transform hover:scale-105 sm:h-16 sm:w-16 lg:bottom-5 lg:right-5"
    >
      <Image
        src="/whatsapp.png"
        alt="WhatsApp"
        width={64}
        height={64}
        className="h-full w-full object-contain drop-shadow-lg"
      />
    </a>
  );
}
