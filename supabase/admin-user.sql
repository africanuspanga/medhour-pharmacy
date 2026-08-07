-- Medhour Pharmacy — the single admin account (hardcoded, only one admin exists).
--
-- Email:    admin@medhour.co.tz
-- Password: Medhour@2026!
--
-- The auth user is provisioned once via the Supabase Auth admin API (service
-- role key required) — SQL cannot safely create auth users:
--
--   curl -X POST "https://vvafnekioriueaaivnff.supabase.co/auth/v1/admin/users" \
--     -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
--     -H "apikey: <SERVICE_ROLE_KEY>" \
--     -H "Content-Type: application/json" \
--     -d '{"email":"admin@medhour.co.tz","password":"Medhour@2026!","email_confirm":true,"user_metadata":{"full_name":"Medhour Admin"}}'
--
-- Then run this file to (re)grant the admin flag — it is idempotent:

update public.profiles
set is_admin = true,
    full_name = coalesce(nullif(full_name, ''), 'Medhour Admin')
where email = 'admin@medhour.co.tz';
