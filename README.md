# carrer (Ramanujonomics)

Career guidance platform — Next.js frontend + [Supabase](https://supabase.com) (database, auth, storage).

**Repo:** [github.com/rushikesh-D69/carrer](https://github.com/rushikesh-D69/carrer)

## Security

- **Never commit** `.env.local` or real API keys. Only `.env.example` (placeholders) is in git.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is meant for the browser; protect data with **Row Level Security** (see `supabase/migrations/001_schema.sql`).
- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — set only in Vercel/host secrets, never `NEXT_PUBLIC_`.

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (database)

Supabase is hosted for you — no self-hosted DB.

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/seed.sql`
3. Copy **Project URL** and **anon public** key from **Settings → API**.

See [supabase/README.md](supabase/README.md) for details.

## Deploy: Vercel + GitHub (recommended)

### 1. GitHub

Code is already on [rushikesh-D69/carrer](https://github.com/rushikesh-D69/carrer).

### 2. Vercel

1. Go to [vercel.com](https://vercel.com) → **Login with GitHub**.
2. **Add New Project** → select `carrer`.
3. **Environment Variables** (Production + Preview):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon / publishable key (safe in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server only |
| `NEXT_PUBLIC_SITE_URL` | e.g. `https://ramanujonomics.vercel.app` then your custom domain |
| `NEXT_PUBLIC_SITE_NAME` | `Ramanujonomics` |

Optional later: `NEXT_PUBLIC_POSTHOG_*`, `RESEND_API_KEY`, Razorpay keys (see `.env.example`).

4. **Deploy** — Vercel gives a URL like `https://your-project.vercel.app` within minutes.

5. In Supabase **Authentication → URL configuration**, add your Vercel URL to **Site URL** and **Redirect URLs** (e.g. `https://*.vercel.app/**`, `https://ramanujonomics.com/**`).

### 3. Custom domain

Buy **ramanujonomics.com**, then in Vercel **Project → Settings → Domains** add the domain and follow DNS instructions. Update `NEXT_PUBLIC_SITE_URL` to `https://ramanujonomics.com`.

## Stack

| Layer | Service |
|-------|---------|
| Frontend | Next.js on Vercel |
| Database / Auth / Storage | Supabase |
| Domain | Your registrar → Vercel DNS |

## Learn more

- [Next.js docs](https://nextjs.org/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
