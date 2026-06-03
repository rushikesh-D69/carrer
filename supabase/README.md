# Supabase setup (Ramanujonomics)

Run these once per Supabase project (SQL Editor or CLI).

## Order

1. **`migrations/001_schema.sql`** — tables, enums, RLS policies, triggers
2. **`seed.sql`** — sample careers, settings, categories

## After migration

- Enable **Email** auth (and OAuth if needed) under Authentication → Providers.
- Create an admin user in Authentication, then assign role in SQL:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<auth-user-uuid>', 'admin');
```

## Security

- All app tables use **Row Level Security**.
- The app uses the **anon** key in the browser; users only see what RLS allows.
- Use **service role** only in trusted server code (never expose as `NEXT_PUBLIC_`).

## Keys (Settings → API)

| Key | Use |
|-----|-----|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` (Vercel secret only) |
