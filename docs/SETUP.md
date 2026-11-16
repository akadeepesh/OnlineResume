# Setup

## Local development

```bash
npm install
cp .env.example .env.local   # every value is optional
npm run dev                  # http://localhost:3000, editor at /editor
```

Checks (the same ones CI runs): `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Environment variables

All variables are listed in [`.env.example`](../.env.example) and validated in [`src/lib/env.ts`](../src/lib/env.ts). A bad value (e.g. a site URL that isn't a URL) stops the build with one error naming every problem. Blank values count as unset.

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | `http://localhost:3000` | Base URL for metadata and absolute links. Production: `https://resume.akadeepesh.com` |
| `NEXT_PUBLIC_TEMPLATE` | public | `classic` | Template shown at `/` |
| `NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER` | public | `true` | Floating template picker |
| `NEXT_PUBLIC_ENABLE_GITHUB_FETCH` | public | `false` | Live repo stats on skills (to be removed) |
| `NEXT_PUBLIC_GH_OWNER` | public | none | GitHub account for those stats (to be removed) |
| `GITHUB_TOKEN` | server | none | Higher GitHub API rate limit |
| `DATABASE_URL` | server | none | Neon Postgres connection string. Accounts and saved resumes need it; the guest editor doesn't |
| `BETTER_AUTH_SECRET` | server | dev secret | Signs sessions. Required in production; at least 32 characters |
| `BETTER_AUTH_URL` | server | `NEXT_PUBLIC_SITE_URL` | Base URL for OAuth callbacks |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | server | none | Google sign-in (button hidden unless both are set) |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | server | none | GitHub sign-in (button hidden unless both are set) |

Rules for adding one:
- `NEXT_PUBLIC_*` values end up in the browser bundle. Never put a secret in one.
- Read public ones with a literal `process.env.NEXT_PUBLIC_X` inside `env.ts` (Next.js only inlines names it can see), then import `clientEnv`.
- Read secrets only through `serverEnv()`, which throws in the browser.
- Add it to `.env.example`, this table and the schema in the same PR.

## Database (Neon + Drizzle)

1. Create a free project at [neon.tech](https://neon.tech) (pick a region close to your Vercel functions, e.g. Frankfurt / `fra1`).
2. Copy the **pooled** connection string into `.env.local` as `DATABASE_URL`.
3. Apply the migrations: `npm run db:migrate`.
4. Optional: browse the data with `npm run db:studio`.

Changing the schema (`src/lib/db/schema.ts`):
1. Edit the schema.
2. `npm run db:generate` writes a new SQL migration to `drizzle/`. Read it, then commit it with the schema change.
3. `npm run db:migrate` applies it. Run it against production before (or right after) deploying code that needs it.

Tables: `users` (Better Auth's user shape + `username`, `plan`), `resumes` (resume JSON as jsonb, slug unique per user, one primary per user), `resume_files` (original upload, max 5 MB), `ai_usage` (AI imports per user per day). `sessions`, `accounts`, `verifications` (Better Auth).

On Vercel, add `DATABASE_URL` for Production (and Preview, ideally pointing at a Neon branch so previews never touch production data).

## Accounts (Better Auth)

Email + password works as soon as the database is set. Google and GitHub buttons appear once their id and secret are both set.

**Secret.** Generate one per environment (`openssl rand -base64 32`, or any 32+ random characters) and set `BETTER_AUTH_SECRET`. Changing it signs everyone out.

**Callback URLs.** Each provider redirects back to `<base URL>/api/auth/callback/<provider>`:

| Environment | Google | GitHub |
|---|---|---|
| Local | `http://localhost:3000/api/auth/callback/google` | `http://localhost:3000/api/auth/callback/github` |
| Production | `https://resume.akadeepesh.com/api/auth/callback/google` | `https://resume.akadeepesh.com/api/auth/callback/github` |

**Google.** [Google Cloud console](https://console.cloud.google.com/) → new project → **APIs & Services → OAuth consent screen**: External, app name, support email, scopes `email`, `profile`, `openid`; publish it (these scopes need no review). Then **Credentials → Create credentials → OAuth client ID** → Web application. Authorized JavaScript origins: `http://localhost:3000` and `https://resume.akadeepesh.com`. Authorized redirect URIs: both Google URLs above. Copy the id and secret.

**GitHub.** A GitHub OAuth App allows one callback URL, so make two: [Settings → Developer settings → OAuth Apps → New](https://github.com/settings/applications/new). Dev app: homepage `http://localhost:3000`, callback the local GitHub URL. Production app: homepage `https://resume.akadeepesh.com`, callback the production GitHub URL. Generate a client secret for each.

Put the dev values in `.env.local` and the production values in Vercel (Production). Preview deployments have changing URLs, so OAuth doesn't work there; email + password does.

**Account linking.** Google or GitHub joins an existing account with the same email only when both emails are verified. Email + password accounts stay unverified until we send verification emails, so someone who signed up with a password keeps using it. Password reset also needs email and comes later.

## Vercel

1. Import the GitHub repo in Vercel (Hobby plan). Framework preset: Next.js; no build settings to change.
2. **Settings → Environment Variables:** set `NEXT_PUBLIC_SITE_URL` for *Production* to `https://resume.akadeepesh.com`. Leave it unset for *Preview* so preview builds use the default, or set it to the preview URL if absolute links matter there. Public variables are inlined at build time, so redeploy after changing one.
3. Every PR gets a preview deployment automatically.

Hobby is for non-commercial use. Move to Pro (or another host) before charging money.

## Domain: resume.akadeepesh.com

1. Vercel → Project → **Settings → Domains → Add** `resume.akadeepesh.com`.
2. At the DNS provider for `akadeepesh.com`, add the record Vercel shows. For a subdomain that is:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `resume` | `cname.vercel-dns.com` |

   (Use the exact value Vercel displays if it differs.)
3. Wait for Vercel to show the domain as valid. It issues the HTTPS certificate itself.
4. Make sure `NEXT_PUBLIC_SITE_URL` matches the domain, then redeploy.

## Coming later

Email sending (verification and password reset) and AI import (Groq, PR 23) add their variables here and to `.env.example` when they land.
