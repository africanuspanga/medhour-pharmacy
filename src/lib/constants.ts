export const SITE = {
  name: "Medhour Pharmacy",
  tagline: "Your Trusted Pharmacy in Dar es Salaam",
  description:
    "Order medicines, healthcare products, personal-care essentials and wellness products from Medhour Pharmacy in Posta, Dar es Salaam.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://medhourpharmacy.co.tz",
  address: {
    name: "Medhour Pharmacy",
    building: "Benjamin Tower",
    street: "Azikiwe Street, Posta",
    city: "Dar es Salaam",
    country: "Tanzania",
  },
  // Placeholders — replace with the pharmacy's real contact details.
  phone: "+255 700 000 000",
  whatsapp: "+255700000000",
  email: "info@medhourpharmacy.co.tz",
  openingHours: "Mon–Sat: 8:00 – 20:00, Sun: 9:00 – 18:00",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Benjamin+Tower,+Azikiwe+Street,+Posta,+Dar+es+Salaam,+Tanzania&output=embed",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Benjamin+Tower,+Azikiwe+Street,+Posta,+Dar+es+Salaam,+Tanzania",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, "")}`;

export const MEDICINE_DISCLAIMER =
  "Medicine information is provided for general reference only. Consult a qualified healthcare professional or pharmacist before using any medicine.";

export const PRODUCTS_PER_PAGE = 12;
