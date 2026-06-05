# Supabase setup (Ramanujonomics)

Run these **in order** in the Supabase SQL Editor (or via CLI migrations).

## Order

| Step | File | Purpose |
|------|------|---------|
| 1 | `migrations/001_schema.sql` | Tables, enums, RLS, base indexes |
| 2 | `migrations/002_production_hardening.sql` | Triggers, RPC grading, tighter RLS, more indexes (**safe to re-run**) |
| 3 | `migrations/003_fix_schema_permissions.sql` | Grant schema permissions to anon/authenticated |
| 4 | `seed.sql` | Sample careers, tests, blogs, events (**safe to re-run**) |

## Production functions (002)

- **`get_test_questions(test_id)`** — returns questions **without** `correct_answer` (safe for clients).
- **`submit_test_attempt(test_id, answers, time_taken)`** — server-side scoring; prevents score tampering.
- **`handle_new_user`** — auto-creates `profiles` + `student` role on signup.

## After migration

1. **Authentication → Providers** — enable Email (and Google if used).
2. **Authentication → URL configuration** — add Vercel URL and custom domain to redirect allow-list.
3. Create admin user in Authentication, then:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<auth-user-uuid>', 'admin');
```

## Keys (Settings → API)

| Key | Use |
|-----|-----|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` (Vercel secret only) |

## Security notes

- All tables use **Row Level Security**.
- Never expose `service_role` to the browser.
- Re-run **002** on existing projects if you deployed before production hardening.
