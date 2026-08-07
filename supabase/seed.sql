-- Medhour Pharmacy — seed data
-- Sample catalogue for development. Prices, stock and prescription
-- classification MUST be verified by the pharmacy before publication.

-- ============ Categories ============
insert into public.categories (name, slug, description, image_url, icon, sort_order) values
  ('Pain Relief', 'pain-relief', 'Relief from headaches, body pain and fever.', '/product-images/panadol-advance-500mg.avif', 'pill', 1),
  ('Cold, Flu and Allergy', 'cold-flu-allergy', 'Cold, flu, cough and allergy relief products.', '/product-images/cetirizine-10mg.webp', 'thermometer', 2),
  ('Vitamins and Supplements', 'vitamins-supplements', 'Daily vitamins, minerals and supplements.', '/product-images/vitamin-c-1000mg.png', 'sparkles', 3),
  ('Mother and Baby', 'mother-baby', 'Everything for mothers, babies and growing families.', '/product-images/pampers-baby-diapers.jpg', 'baby', 4),
  ('Personal Care', 'personal-care', 'Skin, hair, sun and everyday personal care.', '/product-images/nivea-sun-protect-spf50.jpg', 'heart', 5),
  ('First Aid', 'first-aid', 'Antiseptics, bandages and first-aid essentials.', '/product-images/dettol-antiseptic-250ml.jpg', 'cross', 6),
  ('Digestive Health', 'digestive-health', 'Rehydration, antacids and digestive care.', '/product-images/gaviscon-liquid-150ml.webp', 'stomach', 7),
  ('Medical Devices', 'medical-devices', 'Thermometers, monitors and home health devices.', '/product-images/blood-pressure-monitor.jpg', 'monitor', 8)
on conflict (slug) do nothing;

-- ============ Brands ============
insert into public.brands (name, slug) values
  ('GSK', 'gsk'),
  ('Generic', 'generic'),
  ('Dettol', 'dettol'),
  ('Savlon', 'savlon'),
  ('Pampers', 'pampers'),
  ('Johnson''s', 'johnsons'),
  ('Nivea', 'nivea'),
  ('Omron', 'omron')
on conflict (slug) do nothing;

-- ============ Products ============
-- NOTE: prices are sample placeholders in TZS.
with cat as (select id, slug from public.categories),
     br as (select id, slug from public.brands)
insert into public.products
  (name, slug, generic_name, brand_id, category_id, sku, short_description, description,
   usage_info, warnings, keywords, pack_size, price, stock_quantity, low_stock_threshold,
   requires_prescription, is_featured)
values
  ('Panadol Advance 500 mg', 'panadol-advance-500mg', 'Paracetamol',
   (select id from br where slug = 'gsk'), (select id from cat where slug = 'pain-relief'),
   'MED-PR-001', 'Effective relief from headaches, fever and body pain.',
   'Panadol Advance 500 mg tablets provide effective relief from headaches, migraines, fever, toothache and general body pain. The Advance formulation is designed for faster absorption than standard paracetamol tablets.',
   'Adults: 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours. Swallow with water.',
   'Do not take with other paracetamol-containing products. Consult a doctor if symptoms persist. Keep out of reach of children.',
   array['headache','fever','pain','paracetamol','migraine','toothache'],
   '20 tablets', 5000, 120, 20, false, true),

  ('Paracetamol Syrup', 'paracetamol-syrup-100ml', 'Paracetamol',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'cold-flu-allergy'),
   'MED-CH-001', 'Gentle fever and pain relief syrup for children.',
   'Paracetamol syrup for children provides gentle relief from fever and mild to moderate pain, including teething pain, sore throat and immunisation fever.',
   'Shake well before use. Dose according to the child''s age or weight as directed on the label or by a pharmacist.',
   'Do not exceed the stated dose. Do not give with other paracetamol-containing products. Keep out of reach of children.',
   array['children','fever','pain','syrup','teething'],
   '100 ml', 4500, 80, 15, false, true),

  ('Ibuprofen 200 mg', 'ibuprofen-200mg', 'Ibuprofen',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'pain-relief'),
   'MED-PR-002', 'Anti-inflammatory relief for pain, swelling and fever.',
   'Ibuprofen 200 mg tablets relieve pain, reduce inflammation and lower fever. Suitable for headaches, period pain, backache, muscular pain and dental pain.',
   'Adults: 1–2 tablets with food every 4–6 hours as needed. Do not exceed 6 tablets in 24 hours.',
   'Take with food. Not suitable for people with stomach ulcers or certain other conditions — ask the pharmacist. Keep out of reach of children.',
   array['pain','inflammation','fever','period pain','backache'],
   '20 tablets', 6000, 100, 20, false, true),

  ('Cetirizine 10 mg', 'cetirizine-10mg', 'Cetirizine hydrochloride',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'cold-flu-allergy'),
   'MED-AL-001', 'Once-daily relief from hay fever and allergy symptoms.',
   'Cetirizine 10 mg tablets relieve symptoms of hay fever and other allergies, including sneezing, runny nose, itchy eyes and skin rashes (hives).',
   'Adults and children over 12: one tablet once daily with water.',
   'May cause drowsiness in some people. Avoid alcohol. Ask the pharmacist before use in pregnancy or kidney problems.',
   array['allergy','hay fever','sneezing','itchy eyes','antihistamine','hives'],
   '10 tablets', 3500, 90, 15, false, false),

  ('Loratadine 10 mg', 'loratadine-10mg', 'Loratadine',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'cold-flu-allergy'),
   'MED-AL-002', 'Non-drowsy once-daily allergy relief.',
   'Loratadine 10 mg tablets provide non-drowsy relief from hay fever and allergy symptoms including sneezing, runny nose and itchy skin.',
   'Adults and children over 12: one tablet once daily.',
   'Consult the pharmacist before use in pregnancy, breastfeeding or liver problems.',
   array['allergy','hay fever','antihistamine','non-drowsy','sneezing'],
   '10 tablets', 4000, 85, 15, false, false),

  ('Oral Rehydration Salts', 'oral-rehydration-salts-10', 'Oral rehydration salts (ORS)',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'digestive-health'),
   'MED-DH-001', 'Replaces fluids and salts lost through diarrhoea.',
   'Oral Rehydration Salts help replace fluids and electrolytes lost through diarrhoea and vomiting, supporting recovery from dehydration.',
   'Dissolve one sachet in the recommended amount of clean water and sip frequently. Follow the instructions on the sachet.',
   'Seek medical attention if symptoms are severe or persist, especially in young children and the elderly.',
   array['dehydration','diarrhoea','rehydration','ors','fluids'],
   '10 sachets', 3000, 150, 25, false, false),

  ('Gaviscon Liquid', 'gaviscon-liquid-150ml', 'Sodium alginate / antacid',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'digestive-health'),
   'MED-DH-002', 'Fast relief from heartburn and indigestion.',
   'Gaviscon Liquid provides fast, soothing relief from heartburn, acid reflux and indigestion by forming a protective layer over the stomach contents.',
   'Adults: 10–20 ml after meals and at bedtime. Shake well before use.',
   'Consult the pharmacist if symptoms persist or if you are on a sodium-restricted diet.',
   array['heartburn','indigestion','acid reflux','antacid'],
   '150 ml', 12000, 60, 10, false, true),

  ('Vitamin C 1,000 mg', 'vitamin-c-1000mg', 'Ascorbic acid',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'vitamins-supplements'),
   'MED-VT-001', 'High-strength vitamin C to support immune health.',
   'Vitamin C 1,000 mg tablets support the normal function of the immune system and contribute to the reduction of tiredness and fatigue.',
   'Adults: one tablet daily with a meal, or as directed by a healthcare professional.',
   'Food supplements should not replace a varied, balanced diet. Keep out of reach of children.',
   array['vitamin c','immune','immunity','ascorbic acid'],
   '20 tablets', 8000, 110, 20, false, true),

  ('Vitamin D3', 'vitamin-d3-30', 'Cholecalciferol',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'vitamins-supplements'),
   'MED-VT-002', 'Supports bone, muscle and immune health.',
   'Vitamin D3 capsules support the maintenance of normal bones, teeth and muscle function, and contribute to normal immune system function.',
   'Adults: one capsule daily with a meal, or as directed by a healthcare professional.',
   'Food supplements should not replace a varied, balanced diet. Keep out of reach of children.',
   array['vitamin d','vitamin d3','bones','immune'],
   '30 capsules', 10000, 95, 15, false, false),

  ('Zinc Tablets', 'zinc-tablets-30', 'Zinc',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'vitamins-supplements'),
   'MED-VT-003', 'Zinc supplement to support immunity and skin health.',
   'Zinc tablets contribute to the normal function of the immune system and the maintenance of normal skin, hair and nails.',
   'Adults: one tablet daily with food, or as directed by a healthcare professional.',
   'Food supplements should not replace a varied, balanced diet. Keep out of reach of children.',
   array['zinc','immune','skin','supplement'],
   '30 tablets', 7000, 100, 15, false, false),

  ('Multivitamin Tablets', 'multivitamin-tablets-30', 'Multivitamins and minerals',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'vitamins-supplements'),
   'MED-SP-001', 'Complete daily multivitamin for everyday wellness.',
   'A daily multivitamin and mineral supplement formulated to support general health, energy and wellbeing.',
   'Adults: one tablet daily with a meal, or as directed by a healthcare professional.',
   'Food supplements should not replace a varied, balanced diet. Keep out of reach of children.',
   array['multivitamin','daily','wellness','energy','supplement'],
   '30 tablets', 15000, 70, 15, false, true),

  ('Ferrous Sulphate and Folic Acid', 'ferrous-sulphate-folic-acid-30', 'Iron / folic acid',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'vitamins-supplements'),
   'MED-VT-004', 'Iron and folic acid supplement — pharmacist guidance recommended.',
   'Ferrous sulphate with folic acid is used to help prevent or treat iron-deficiency anaemia, including during pregnancy, under professional guidance.',
   'Take as directed by a pharmacist or healthcare professional, usually one tablet daily.',
   'Speak to the pharmacist before use, especially during pregnancy. Iron supplements can be harmful to children if taken in overdose — keep out of reach.',
   array['iron','anaemia','folic acid','pregnancy'],
   '30 tablets', 6500, 75, 15, false, false),

  ('Dettol Antiseptic Liquid', 'dettol-antiseptic-250ml', 'Chloroxylenol solution',
   (select id from br where slug = 'dettol'), (select id from cat where slug = 'first-aid'),
   'MED-FA-001', 'Trusted antiseptic for first aid and hygiene.',
   'Dettol Antiseptic Liquid protects against germs. Can be used diluted for first aid on cuts and grazes, and for personal and home hygiene.',
   'Dilute before use as directed on the label. For external use only.',
   'For external use only. Do not swallow. Keep out of reach of children.',
   array['antiseptic','dettol','first aid','cuts','grazes','hygiene'],
   '250 ml', 9000, 90, 15, false, true),

  ('Savlon Antiseptic Cream', 'savlon-antiseptic-cream-30g', 'Cetrimide / chlorhexidine',
   (select id from br where slug = 'savlon'), (select id from cat where slug = 'first-aid'),
   'MED-FA-002', 'Soothing antiseptic cream for minor wounds.',
   'Savlon Antiseptic Cream helps cleanse and protect minor wounds, cuts, grazes, insect bites and minor burns.',
   'Clean the affected area and apply a small amount of cream. Repeat as needed. For external use only.',
   'For external use only. If symptoms persist, consult a healthcare professional.',
   array['antiseptic','savlon','cream','wounds','bites','burns'],
   '30 g', 5500, 85, 15, false, false),

  ('Crepe Bandage', 'crepe-bandage', 'Elastic support bandage',
   (select id from br where slug = 'generic'), (select id from cat where slug = 'first-aid'),
   'MED-FA-003', 'Support bandage for sprains and strains.',
   'A washable, reusable crepe bandage that provides support and compression for sprains, strains and minor injuries.',
   'Wrap firmly but not too tightly around the affected area. Secure with clips.',
   'Do not wrap too tightly — loosen if numbness or tingling occurs.',
   array['bandage','sprain','strain','support','first aid'],
   'One piece', 4000, 120, 20, false, false),

  ('Digital Thermometer', 'digital-thermometer', null,
   (select id from br where slug = 'generic'), (select id from cat where slug = 'medical-devices'),
   'MED-MD-001', 'Fast, accurate digital temperature readings.',
   'A digital thermometer providing fast and accurate temperature readings for the whole family. Features a clear digital display and audible signal.',
   'Use orally, under the arm or rectally as directed in the instructions. Clean before and after each use.',
   'Read the instruction leaflet before use. Keep out of reach of children.',
   array['thermometer','temperature','fever','device'],
   'One unit', 15000, 50, 10, false, true),

  ('Blood Pressure Monitor', 'blood-pressure-monitor', null,
   (select id from br where slug = 'omron'), (select id from cat where slug = 'medical-devices'),
   'MED-MD-002', 'Automatic upper-arm blood pressure monitoring at home.',
   'An automatic upper-arm blood pressure monitor for convenient, accurate home monitoring of blood pressure and pulse.',
   'Rest for 5 minutes before measuring. Sit comfortably with the cuff on the upper arm and follow the device instructions.',
   'Home monitoring does not replace regular check-ups. Share unusual readings with a healthcare professional.',
   array['blood pressure','monitor','bp','hypertension','device'],
   'One unit', 85000, 25, 5, false, true),

  ('Pampers Baby Diapers', 'pampers-baby-diapers', null,
   (select id from br where slug = 'pampers'), (select id from cat where slug = 'mother-baby'),
   'MED-MB-001', 'Soft, absorbent diapers to keep baby dry and comfortable.',
   'Pampers baby diapers offer up to 12 hours of dryness with a soft, breathable material that is gentle on delicate baby skin.',
   'Change regularly and clean the baby''s skin at each change. Choose the size according to the baby''s weight.',
   'Keep packaging away from babies and children to avoid suffocation.',
   array['diapers','baby','pampers','nappies'],
   'One pack', 28000, 60, 10, false, true),

  ('Johnson''s Baby Lotion', 'johnsons-baby-lotion-200ml', null,
   (select id from br where slug = 'johnsons'), (select id from cat where slug = 'mother-baby'),
   'MED-MB-002', 'Gentle, moisturising lotion for delicate baby skin.',
   'Johnson''s Baby Lotion is a mild, clinically proven gentle moisturiser that helps protect delicate baby skin from dryness.',
   'Apply gently over the baby''s body after bathing or as needed. For external use only.',
   'For external use only. Keep out of reach of children.',
   array['baby','lotion','moisturiser','skin'],
   '200 ml', 11000, 70, 12, false, false),

  ('Nivea Sun Protect SPF 50', 'nivea-sun-protect-spf50', null,
   (select id from br where slug = 'nivea'), (select id from cat where slug = 'personal-care'),
   'MED-PC-001', 'High SPF 50 sun protection for face and body.',
   'Nivea Sun Protect SPF 50 provides immediate, highly effective UVA/UVB protection to help prevent sunburn and long-term skin damage.',
   'Apply generously before sun exposure and reapply frequently, especially after swimming or towelling.',
   'Avoid intense midday sun. Keep babies and young children out of direct sunlight. For external use only.',
   array['sunscreen','spf','sun protection','nivea','skin'],
   '50 ml', 18000, 65, 12, false, false)
on conflict (slug) do nothing;

-- ============ Site settings ============
insert into public.site_settings (key, value) values
  ('phone', '+255 716 221 692'),
  ('whatsapp', '+255716221692'),
  ('email', 'info@medhour.co.tz'),
  ('opening_hours', 'Mon–Sat: 8:00 – 20:00, Sun: 9:00 – 18:00'),
  ('delivery_fee_dar', '3000')
on conflict (key) do nothing;

-- ============ Product images ============
-- Images are served from the site's /public/product-images folder.
-- They can later be replaced with Supabase Storage uploads from the admin dashboard.
insert into public.product_images (product_id, image_url, alt_text, sort_order)
select p.id, v.image_url, p.name, 1
from public.products p
join (values
  ('panadol-advance-500mg', '/product-images/panadol-advance-500mg.avif'),
  ('paracetamol-syrup-100ml', '/product-images/paracetamol-syrup-100ml.jpg'),
  ('ibuprofen-200mg', '/product-images/ibuprofen-200mg.jpg'),
  ('cetirizine-10mg', '/product-images/cetirizine-10mg.webp'),
  ('loratadine-10mg', '/product-images/loratadine-10mg.jpg'),
  ('oral-rehydration-salts-10', '/product-images/oral-rehydration-salts-10.webp'),
  ('gaviscon-liquid-150ml', '/product-images/gaviscon-liquid-150ml.webp'),
  ('vitamin-c-1000mg', '/product-images/vitamin-c-1000mg.png'),
  ('zinc-tablets-30', '/product-images/zinc-tablets-30.jpg'),
  ('multivitamin-tablets-30', '/product-images/multivitamin-tablets-30.webp'),
  ('ferrous-sulphate-folic-acid-30', '/product-images/ferrous-sulphate-folic-acid-30.jpg'),
  ('dettol-antiseptic-250ml', '/product-images/dettol-antiseptic-250ml.jpg'),
  ('savlon-antiseptic-cream-30g', '/product-images/savlon-antiseptic-cream-30g.jpg'),
  ('crepe-bandage', '/product-images/crepe-bandage.jpg'),
  ('digital-thermometer', '/product-images/digital-thermometer.webp'),
  ('blood-pressure-monitor', '/product-images/blood-pressure-monitor.jpg'),
  ('pampers-baby-diapers', '/product-images/pampers-baby-diapers.jpg'),
  ('johnsons-baby-lotion-200ml', '/product-images/johnsons-baby-lotion-200ml.avif'),
  ('nivea-sun-protect-spf50', '/product-images/nivea-sun-protect-spf50.jpg')
) as v(slug, image_url) on v.slug = p.slug
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id
);
