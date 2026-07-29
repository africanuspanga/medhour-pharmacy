import type { Brand, Category, Product } from "@/lib/types";

/**
 * Local catalogue used ONLY when Supabase is not configured (or a query
 * fails) — keeps the preview fully populated before the database is set up.
 * Once real Supabase keys are in .env.local and the seed has run, all data
 * comes from the database and this file is never read.
 * Mirrors supabase/seed.sql.
 */

const NOW = new Date().toISOString();

function cat(
  id: string,
  name: string,
  slug: string,
  sort_order: number,
  description: string,
  image_url: string
): Category {
  return {
    id: `cat-${id}`,
    name,
    slug,
    description,
    image_url,
    icon: null,
    sort_order,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const FALLBACK_CATEGORIES: Category[] = [
  cat("1", "Pain Relief", "pain-relief", 1, "Relief from headaches, body pain and fever.", "/product-images/panadol-advance-500mg.avif"),
  cat("2", "Cold, Flu and Allergy", "cold-flu-allergy", 2, "Cold, flu, cough and allergy relief products.", "/product-images/cetirizine-10mg.webp"),
  cat("3", "Vitamins and Supplements", "vitamins-supplements", 3, "Daily vitamins, minerals and supplements.", "/product-images/vitamin-c-1000mg.png"),
  cat("4", "Mother and Baby", "mother-baby", 4, "Everything for mothers, babies and growing families.", "/product-images/pampers-baby-diapers.jpg"),
  cat("5", "Personal Care", "personal-care", 5, "Skin, hair, sun and everyday personal care.", "/product-images/nivea-sun-protect-spf50.jpg"),
  cat("6", "First Aid", "first-aid", 6, "Antiseptics, bandages and first-aid essentials.", "/product-images/dettol-antiseptic-250ml.jpg"),
  cat("7", "Digestive Health", "digestive-health", 7, "Rehydration, antacids and digestive care.", "/product-images/gaviscon-liquid-150ml.webp"),
  cat("8", "Medical Devices", "medical-devices", 8, "Thermometers, monitors and home health devices.", "/product-images/blood-pressure-monitor.jpg"),
];

const BRANDS: Record<string, Brand> = {
  gsk: { id: "brand-gsk", name: "GSK", slug: "gsk", created_at: NOW },
  generic: { id: "brand-generic", name: "Generic", slug: "generic", created_at: NOW },
  dettol: { id: "brand-dettol", name: "Dettol", slug: "dettol", created_at: NOW },
  savlon: { id: "brand-savlon", name: "Savlon", slug: "savlon", created_at: NOW },
  pampers: { id: "brand-pampers", name: "Pampers", slug: "pampers", created_at: NOW },
  johnsons: { id: "brand-johnsons", name: "Johnson's", slug: "johnsons", created_at: NOW },
  nivea: { id: "brand-nivea", name: "Nivea", slug: "nivea", created_at: NOW },
  omron: { id: "brand-omron", name: "Omron", slug: "omron", created_at: NOW },
};

interface SeedProduct {
  name: string;
  slug: string;
  generic?: string;
  brand: keyof typeof BRANDS;
  category: string; // category slug
  pack: string;
  price: number;
  stock: number;
  featured?: boolean;
  image?: string;
  short: string;
  description: string;
  usage: string;
  warnings: string;
  keywords: string[];
}

const SEED: SeedProduct[] = [
  {
    name: "Panadol Advance 500 mg", slug: "panadol-advance-500mg", generic: "Paracetamol",
    brand: "gsk", category: "pain-relief", pack: "20 tablets", price: 5000, stock: 120, featured: true,
    image: "/product-images/panadol-advance-500mg.avif",
    short: "Effective relief from headaches, fever and body pain.",
    description: "Panadol Advance 500 mg tablets provide effective relief from headaches, migraines, fever, toothache and general body pain. The Advance formulation is designed for faster absorption than standard paracetamol tablets.",
    usage: "Adults: 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours. Swallow with water.",
    warnings: "Do not take with other paracetamol-containing products. Consult a doctor if symptoms persist. Keep out of reach of children.",
    keywords: ["headache", "fever", "pain", "paracetamol", "migraine", "toothache"],
  },
  {
    name: "Paracetamol Syrup", slug: "paracetamol-syrup-100ml", generic: "Paracetamol",
    brand: "generic", category: "cold-flu-allergy", pack: "100 ml", price: 4500, stock: 80, featured: true,
    image: "/product-images/paracetamol-syrup-100ml.jpg",
    short: "Gentle fever and pain relief syrup for children.",
    description: "Paracetamol syrup for children provides gentle relief from fever and mild to moderate pain, including teething pain, sore throat and immunisation fever.",
    usage: "Shake well before use. Dose according to the child's age or weight as directed on the label or by a pharmacist.",
    warnings: "Do not exceed the stated dose. Do not give with other paracetamol-containing products. Keep out of reach of children.",
    keywords: ["children", "fever", "pain", "syrup", "teething"],
  },
  {
    name: "Ibuprofen 200 mg", slug: "ibuprofen-200mg", generic: "Ibuprofen",
    brand: "generic", category: "pain-relief", pack: "20 tablets", price: 6000, stock: 100, featured: true,
    image: "/product-images/ibuprofen-200mg.jpg",
    short: "Anti-inflammatory relief for pain, swelling and fever.",
    description: "Ibuprofen 200 mg tablets relieve pain, reduce inflammation and lower fever. Suitable for headaches, period pain, backache, muscular pain and dental pain.",
    usage: "Adults: 1–2 tablets with food every 4–6 hours as needed. Do not exceed 6 tablets in 24 hours.",
    warnings: "Take with food. Not suitable for people with stomach ulcers or certain other conditions — ask the pharmacist. Keep out of reach of children.",
    keywords: ["pain", "inflammation", "fever", "period pain", "backache"],
  },
  {
    name: "Cetirizine 10 mg", slug: "cetirizine-10mg", generic: "Cetirizine hydrochloride",
    brand: "generic", category: "cold-flu-allergy", pack: "10 tablets", price: 3500, stock: 90,
    image: "/product-images/cetirizine-10mg.webp",
    short: "Once-daily relief from hay fever and allergy symptoms.",
    description: "Cetirizine 10 mg tablets relieve symptoms of hay fever and other allergies, including sneezing, runny nose, itchy eyes and skin rashes (hives).",
    usage: "Adults and children over 12: one tablet once daily with water.",
    warnings: "May cause drowsiness in some people. Avoid alcohol. Ask the pharmacist before use in pregnancy or kidney problems.",
    keywords: ["allergy", "hay fever", "sneezing", "itchy eyes", "antihistamine", "hives"],
  },
  {
    name: "Loratadine 10 mg", slug: "loratadine-10mg", generic: "Loratadine",
    brand: "generic", category: "cold-flu-allergy", pack: "10 tablets", price: 4000, stock: 85,
    image: "/product-images/loratadine-10mg.jpg",
    short: "Non-drowsy once-daily allergy relief.",
    description: "Loratadine 10 mg tablets provide non-drowsy relief from hay fever and allergy symptoms including sneezing, runny nose and itchy skin.",
    usage: "Adults and children over 12: one tablet once daily.",
    warnings: "Consult the pharmacist before use in pregnancy, breastfeeding or liver problems.",
    keywords: ["allergy", "hay fever", "antihistamine", "non-drowsy", "sneezing"],
  },
  {
    name: "Oral Rehydration Salts", slug: "oral-rehydration-salts-10", generic: "Oral rehydration salts (ORS)",
    brand: "generic", category: "digestive-health", pack: "10 sachets", price: 3000, stock: 150,
    image: "/product-images/oral-rehydration-salts-10.webp",
    short: "Replaces fluids and salts lost through diarrhoea.",
    description: "Oral Rehydration Salts help replace fluids and electrolytes lost through diarrhoea and vomiting, supporting recovery from dehydration.",
    usage: "Dissolve one sachet in the recommended amount of clean water and sip frequently. Follow the instructions on the sachet.",
    warnings: "Seek medical attention if symptoms are severe or persist, especially in young children and the elderly.",
    keywords: ["dehydration", "diarrhoea", "rehydration", "ors", "fluids"],
  },
  {
    name: "Gaviscon Liquid", slug: "gaviscon-liquid-150ml", generic: "Sodium alginate / antacid",
    brand: "generic", category: "digestive-health", pack: "150 ml", price: 12000, stock: 60, featured: true,
    image: "/product-images/gaviscon-liquid-150ml.webp",
    short: "Fast relief from heartburn and indigestion.",
    description: "Gaviscon Liquid provides fast, soothing relief from heartburn, acid reflux and indigestion by forming a protective layer over the stomach contents.",
    usage: "Adults: 10–20 ml after meals and at bedtime. Shake well before use.",
    warnings: "Consult the pharmacist if symptoms persist or if you are on a sodium-restricted diet.",
    keywords: ["heartburn", "indigestion", "acid reflux", "antacid"],
  },
  {
    name: "Vitamin C 1,000 mg", slug: "vitamin-c-1000mg", generic: "Ascorbic acid",
    brand: "generic", category: "vitamins-supplements", pack: "20 tablets", price: 8000, stock: 110, featured: true,
    image: "/product-images/vitamin-c-1000mg.png",
    short: "High-strength vitamin C to support immune health.",
    description: "Vitamin C 1,000 mg tablets support the normal function of the immune system and contribute to the reduction of tiredness and fatigue.",
    usage: "Adults: one tablet daily with a meal, or as directed by a healthcare professional.",
    warnings: "Food supplements should not replace a varied, balanced diet. Keep out of reach of children.",
    keywords: ["vitamin c", "immune", "immunity", "ascorbic acid"],
  },
  {
    name: "Vitamin D3", slug: "vitamin-d3-30", generic: "Cholecalciferol",
    brand: "generic", category: "vitamins-supplements", pack: "30 capsules", price: 10000, stock: 95,
    short: "Supports bone, muscle and immune health.",
    description: "Vitamin D3 capsules support the maintenance of normal bones, teeth and muscle function, and contribute to normal immune system function.",
    usage: "Adults: one capsule daily with a meal, or as directed by a healthcare professional.",
    warnings: "Food supplements should not replace a varied, balanced diet. Keep out of reach of children.",
    keywords: ["vitamin d", "vitamin d3", "bones", "immune"],
  },
  {
    name: "Zinc Tablets", slug: "zinc-tablets-30", generic: "Zinc",
    brand: "generic", category: "vitamins-supplements", pack: "30 tablets", price: 7000, stock: 100,
    image: "/product-images/zinc-tablets-30.jpg",
    short: "Zinc supplement to support immunity and skin health.",
    description: "Zinc tablets contribute to the normal function of the immune system and the maintenance of normal skin, hair and nails.",
    usage: "Adults: one tablet daily with food, or as directed by a healthcare professional.",
    warnings: "Food supplements should not replace a varied, balanced diet. Keep out of reach of children.",
    keywords: ["zinc", "immune", "skin", "supplement"],
  },
  {
    name: "Multivitamin Tablets", slug: "multivitamin-tablets-30", generic: "Multivitamins and minerals",
    brand: "generic", category: "vitamins-supplements", pack: "30 tablets", price: 15000, stock: 70, featured: true,
    image: "/product-images/multivitamin-tablets-30.webp",
    short: "Complete daily multivitamin for everyday wellness.",
    description: "A daily multivitamin and mineral supplement formulated to support general health, energy and wellbeing.",
    usage: "Adults: one tablet daily with a meal, or as directed by a healthcare professional.",
    warnings: "Food supplements should not replace a varied, balanced diet. Keep out of reach of children.",
    keywords: ["multivitamin", "daily", "wellness", "energy", "supplement"],
  },
  {
    name: "Ferrous Sulphate and Folic Acid", slug: "ferrous-sulphate-folic-acid-30", generic: "Iron / folic acid",
    brand: "generic", category: "vitamins-supplements", pack: "30 tablets", price: 6500, stock: 75,
    image: "/product-images/ferrous-sulphate-folic-acid-30.jpg",
    short: "Iron and folic acid supplement — pharmacist guidance recommended.",
    description: "Ferrous sulphate with folic acid is used to help prevent or treat iron-deficiency anaemia, including during pregnancy, under professional guidance.",
    usage: "Take as directed by a pharmacist or healthcare professional, usually one tablet daily.",
    warnings: "Speak to the pharmacist before use, especially during pregnancy. Iron supplements can be harmful to children if taken in overdose — keep out of reach.",
    keywords: ["iron", "anaemia", "folic acid", "pregnancy"],
  },
  {
    name: "Dettol Antiseptic Liquid", slug: "dettol-antiseptic-250ml", generic: "Chloroxylenol solution",
    brand: "dettol", category: "first-aid", pack: "250 ml", price: 9000, stock: 90, featured: true,
    image: "/product-images/dettol-antiseptic-250ml.jpg",
    short: "Trusted antiseptic for first aid and hygiene.",
    description: "Dettol Antiseptic Liquid protects against germs. Can be used diluted for first aid on cuts and grazes, and for personal and home hygiene.",
    usage: "Dilute before use as directed on the label. For external use only.",
    warnings: "For external use only. Do not swallow. Keep out of reach of children.",
    keywords: ["antiseptic", "dettol", "first aid", "cuts", "grazes", "hygiene"],
  },
  {
    name: "Savlon Antiseptic Cream", slug: "savlon-antiseptic-cream-30g", generic: "Cetrimide / chlorhexidine",
    brand: "savlon", category: "first-aid", pack: "30 g", price: 5500, stock: 85,
    image: "/product-images/savlon-antiseptic-cream-30g.jpg",
    short: "Soothing antiseptic cream for minor wounds.",
    description: "Savlon Antiseptic Cream helps cleanse and protect minor wounds, cuts, grazes, insect bites and minor burns.",
    usage: "Clean the affected area and apply a small amount of cream. Repeat as needed. For external use only.",
    warnings: "For external use only. If symptoms persist, consult a healthcare professional.",
    keywords: ["antiseptic", "savlon", "cream", "wounds", "bites", "burns"],
  },
  {
    name: "Crepe Bandage", slug: "crepe-bandage", generic: "Elastic support bandage",
    brand: "generic", category: "first-aid", pack: "One piece", price: 4000, stock: 120,
    image: "/product-images/crepe-bandage.jpg",
    short: "Support bandage for sprains and strains.",
    description: "A washable, reusable crepe bandage that provides support and compression for sprains, strains and minor injuries.",
    usage: "Wrap firmly but not too tightly around the affected area. Secure with clips.",
    warnings: "Do not wrap too tightly — loosen if numbness or tingling occurs.",
    keywords: ["bandage", "sprain", "strain", "support", "first aid"],
  },
  {
    name: "Digital Thermometer", slug: "digital-thermometer",
    brand: "generic", category: "medical-devices", pack: "One unit", price: 15000, stock: 50, featured: true,
    image: "/product-images/digital-thermometer.webp",
    short: "Fast, accurate digital temperature readings.",
    description: "A digital thermometer providing fast and accurate temperature readings for the whole family. Features a clear digital display and audible signal.",
    usage: "Use orally, under the arm or rectally as directed in the instructions. Clean before and after each use.",
    warnings: "Read the instruction leaflet before use. Keep out of reach of children.",
    keywords: ["thermometer", "temperature", "fever", "device"],
  },
  {
    name: "Blood Pressure Monitor", slug: "blood-pressure-monitor",
    brand: "omron", category: "medical-devices", pack: "One unit", price: 85000, stock: 25, featured: true,
    image: "/product-images/blood-pressure-monitor.jpg",
    short: "Automatic upper-arm blood pressure monitoring at home.",
    description: "An automatic upper-arm blood pressure monitor for convenient, accurate home monitoring of blood pressure and pulse.",
    usage: "Rest for 5 minutes before measuring. Sit comfortably with the cuff on the upper arm and follow the device instructions.",
    warnings: "Home monitoring does not replace regular check-ups. Share unusual readings with a healthcare professional.",
    keywords: ["blood pressure", "monitor", "bp", "hypertension", "device"],
  },
  {
    name: "Pampers Baby Diapers", slug: "pampers-baby-diapers",
    brand: "pampers", category: "mother-baby", pack: "One pack", price: 28000, stock: 60, featured: true,
    image: "/product-images/pampers-baby-diapers.jpg",
    short: "Soft, absorbent diapers to keep baby dry and comfortable.",
    description: "Pampers baby diapers offer up to 12 hours of dryness with a soft, breathable material that is gentle on delicate baby skin.",
    usage: "Change regularly and clean the baby's skin at each change. Choose the size according to the baby's weight.",
    warnings: "Keep packaging away from babies and children to avoid suffocation.",
    keywords: ["diapers", "baby", "pampers", "nappies"],
  },
  {
    name: "Johnson's Baby Lotion", slug: "johnsons-baby-lotion-200ml",
    brand: "johnsons", category: "mother-baby", pack: "200 ml", price: 11000, stock: 70,
    image: "/product-images/johnsons-baby-lotion-200ml.avif",
    short: "Gentle, moisturising lotion for delicate baby skin.",
    description: "Johnson's Baby Lotion is a mild, clinically proven gentle moisturiser that helps protect delicate baby skin from dryness.",
    usage: "Apply gently over the baby's body after bathing or as needed. For external use only.",
    warnings: "For external use only. Keep out of reach of children.",
    keywords: ["baby", "lotion", "moisturiser", "skin"],
  },
  {
    name: "Nivea Sun Protect SPF 50", slug: "nivea-sun-protect-spf50",
    brand: "nivea", category: "personal-care", pack: "50 ml", price: 18000, stock: 65,
    image: "/product-images/nivea-sun-protect-spf50.jpg",
    short: "High SPF 50 sun protection for face and body.",
    description: "Nivea Sun Protect SPF 50 provides immediate, highly effective UVA/UVB protection to help prevent sunburn and long-term skin damage.",
    usage: "Apply generously before sun exposure and reapply frequently, especially after swimming or towelling.",
    warnings: "Avoid intense midday sun. Keep babies and young children out of direct sunlight. For external use only.",
    keywords: ["sunscreen", "spf", "sun protection", "nivea", "skin"],
  },
];

export const FALLBACK_PRODUCTS: Product[] = SEED.map((s, i) => {
  const category = FALLBACK_CATEGORIES.find((c) => c.slug === s.category)!;
  const brand = BRANDS[s.brand];
  return {
    id: `prod-${i + 1}`,
    name: s.name,
    slug: s.slug,
    generic_name: s.generic ?? null,
    brand_id: brand.id,
    category_id: category.id,
    sku: `MED-${String(i + 1).padStart(4, "0")}`,
    description: s.description,
    short_description: s.short,
    usage_info: s.usage,
    warnings: s.warnings,
    keywords: s.keywords,
    pack_size: s.pack,
    price: s.price,
    sale_price: null,
    stock_quantity: s.stock,
    low_stock_threshold: 5,
    requires_prescription: false,
    is_featured: s.featured ?? false,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
    category,
    brand,
    images: s.image
      ? [
          {
            id: `img-${i + 1}`,
            product_id: `prod-${i + 1}`,
            image_url: s.image,
            alt_text: s.name,
            sort_order: 1,
            created_at: NOW,
          },
        ]
      : [],
  };
});

/** True when Supabase env vars are missing or still placeholders. */
export function supabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return Boolean(url && key && !url.includes("placeholder") && !key.includes("placeholder"));
}
