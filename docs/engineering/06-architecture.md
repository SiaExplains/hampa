---
title: Architecture
type: reference
status: locked
updated: 2026-10-20
---

# Architecture

Deliberately the FocusCrew stack minus everything Hampa doesn't need (no shared package yet, no realtime, no payments, no AI). One repo, one deploy, four vendors.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15+ App Router**, TypeScript strict | PWA + server actions + route handlers in one deploy |
| UI | **Tailwind CSS + shadcn/ui** (Radix) | unstyled primitives take the brand tokens; RTL support via logical properties |
| Fonts | **Vazirmatn** (fa) + **Inter** (en/de), self-hosted `next/font/local`, weights 400/500/600/700 | Vazirmatn **Farsi-Digits build** (`Vazirmatn-FD-*`) for Persian digits — v33 has no `ss01` (H0, 2026-10-20) |
| i18n | **next-intl**, `[locale]` URL segment | see `07-i18n.md` |
| API | **tRPC v11** in `app/api/trpc/[trpc]/route.ts` + React Query | end-to-end types; the mobile app will consume the same router later |
| Validation | **zod** schemas in `src/lib/validation/` | single source for forms + API |
| DB | **Supabase Postgres (eu-central-1, Frankfurt)**, **Drizzle ORM** with `postgres-js` | Transaction pooler `:6543` for the app (`DATABASE_URL`), direct `:5432` for migrations (`DIRECT_URL`) |
| Auth | **Supabase Auth** via `@supabase/ssr` | email+password, magic link; Google OAuth later by dashboard toggle. `public.users.id` FK → `auth.users.id`, row created by a Postgres trigger |
| Storage | **Supabase Storage** buckets `avatars` (public read, 2 MB), `documents` (public read, rules PDFs) | created via migration SQL, not the dashboard |
| Email | **Resend** + React Email templates | auth mails (custom SMTP in Supabase → Resend), notifications |
| Push | **Web Push** (`web-push` npm, VAPID) | PWA notifications on Android; iOS 16.4+ when installed to home screen |
| PWA | **@serwist/next** | manifest, offline shell, push service worker |
| Hosting | **Vercel** Hobby (non-commercial — fits the terms), **Function Region `fra1`** | set region on project creation; default is US |
| Cron | **Vercel Cron** | Hobby: 2 crons, daily only → see "Scheduled work" |
| CI | **GitHub Actions**, one job, PRs only | see `09-engineering-standards.md` |
| Errors | Vercel logs + `console.error` with a request id; Sentry later if needed | no extra vendor at launch |
| Analytics | none at launch; Vercel Web Analytics (cookieless) can be toggled later | GDPR-simple |

**Not in the stack, don't add without asking:** Prisma, NextAuth/Auth.js, Clerk, Redis, Upstash, Firebase, Expo (Phase 1), any CSS-in-JS, Moment.js (use `date-fns` + `date-fns-tz` / `Intl`).

## Repo layout (`SiaExplains/hampa`)

```
hampa/
├─ CLAUDE.md                    ← short, points to docs/
├─ docs/engineering/            ← this handbook, copied in
├─ src/
│  ├─ app/
│  │  ├─ [locale]/              ← all pages; (auth) and (app) route groups
│  │  │  ├─ (public)/           ← /i/[code], /signup, /login, /legal/*
│  │  │  ├─ (app)/              ← /, /events, /sports, /u/[username], /settings, /notifications, /rules
│  │  │  └─ (admin)/admin/*     
│  │  ├─ api/trpc/[trpc]/route.ts
│  │  ├─ api/cron/*/route.ts    ← protected by CRON_SECRET
│  │  ├─ api/health/route.ts
│  │  ├─ checkin/[eventId]/[token]/route.ts   ← QR landing (redirects into [locale])
│  │  └─ manifest.ts, sw.ts
│  ├─ components/ (ui/ = shadcn, feature folders beside)
│  ├─ db/ (schema/*.ts, migrations/, seed.ts, client.ts)
│  ├─ server/
│  │  ├─ trpc/ (context.ts, trpc.ts, routers/*.ts, root.ts)
│  │  ├─ auth/ (session.ts, permissions.ts)
│  │  ├─ gamification/ (config.ts, xp.ts, levels.ts, streak.ts, recompute.ts)
│  │  ├─ notifications/ (dispatch.ts, email/, push.ts, templates/)
│  │  ├─ invites/, events/, attendance/, erasure.ts, export.ts
│  ├─ i18n/ (routing.ts, request.ts, messages/{fa,en,de}.json)
│  ├─ lib/ (validation/, dates.ts, utils.ts)
│  └─ styles/ (globals.css, tokens.css)
├─ emails/ (React Email templates)
├─ drizzle.config.ts · next.config.ts · vercel.json   (no tailwind.config: Tailwind v4 is configured in src/styles/globals.css)
└─ .github/workflows/ci.yml
```

## API design (tRPC routers)

| Router | Procedures (summary) |
|---|---|
| `auth` | `me`, `completeSignup(inviteCode, profile, consents)`, `updateProfile` |
| `invite` | `create(kind, email?)`, `list`, `revoke`, `resolve(code)` (public), `founding.create/revoke` (owner) |
| `approval` | `queue`, `approve(userId)`, `reject(userId, reason)` |
| `sport` | `list`, `bySlug`, `join`, `leave`, `create` (owner), `update`, `assignCoach`, `removeCoach` |
| `event` | `upcoming(filter)`, `byId`, `create`, `update`, `publish`, `cancel`, `close`, `ics(id)` |
| `registration` | `register`, `leave` |
| `attendance` | `listForEvent`, `setChecklist(eventId, userIds[])`, `void`, `qrToken(eventId)`, `checkin(eventId, token)` |
| `match` | `create`, `update`, `delete`, `listForEvent` |
| `stats` | `forUser(userId)`, `forUserSport(userId, sportId)` — reads caches only |
| `follow` | `follow`, `unfollow`, `followers`, `following` |
| `rules` | `current`, `accept(version)`, `publish` (admin) |
| `notification` | `list`, `markRead`, `markAllRead`, `preferences.get/set`, `push.subscribe/unsubscribe` |
| `admin` | `users.search/get/suspend/erase`, `roles.promote/demote`, `xp.adjust`, `gem.adjust`, `audit.list` |
| `account` | `export`, `delete` |

Rules:
1. Every procedure: zod input → `can()` check → service function → return DTO. No Drizzle calls in routers; they live in `src/server/<domain>/`.
2. **Mutations that change ledgers run in a transaction** and call `recomputeUserStats` before commit.
3. Public procedures (`invite.resolve`, legal pages) are the only unauthenticated surface.
4. Server Components fetch via the tRPC server caller; client components via React Query hooks. No direct Supabase client queries from the browser (anon key is only for Auth).

## Auth flow

- Proxy (`src/proxy.ts` — Next 16 renamed `middleware.ts` to `proxy.ts`): refreshes Supabase session cookie, resolves locale, redirects unauthenticated users on `(app)` and `(admin)` routes to `/login`, redirects `pending_approval` users to `/waiting`.
- tRPC context loads `auth.user` → `public.users` row once per request.
- Step-up auth for destructive admin actions: re-enter password within 5 minutes (Supabase `reauthenticate`).

## Scheduled work (Vercel Cron, Hobby limits: 2 jobs, daily)

| Cron | Route | Does |
|---|---|---|
| `0 3 * * *` daily | `/api/cron/nightly` | recompute stats for active users, elder flags, streak resets, close events ended >24h, expire invites, approver digest, **keep-alive query** |
| `0 * * * *` hourly (Pro only) | `/api/cron/reminders` | 24h/2h reminders |

**Hobby workaround for reminders:** the nightly cron pre-computes every reminder due in the next 24h into `notifications` with a `deliver_at`; a lightweight **external pinger** (e.g. cron-job.org, free) hits `/api/cron/deliver` every 15 min with `CRON_SECRET`. If/when the project moves to Vercel Pro, switch to the hourly cron and drop the pinger. **Do not use GitHub Actions `schedule` for this.**

All cron routes require `Authorization: Bearer ${CRON_SECRET}` and are idempotent.

## Environment variables (`.env.example` — names only, never values)

```
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=            # pooler :6543
DIRECT_URL=              # direct :5432, migrations only
RESEND_API_KEY=
EMAIL_FROM=              # e.g. Hampa <hello@hampaclub.com>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=           # mailto:
CRON_SECRET=
HAMPA_OWNER_EMAIL=
```

Production secrets live only in Vercel. **One Supabase project (named `hampa` in the dashboard; referred to as hampa-prod here), no staging** — decided 2026-10-20 to keep it simple. Consequences: Vercel preview deployments get the same DB env, so previews run against production data; local dev uses a local Postgres (`docker run postgres:16` or `supabase start`) for schema work, and migrations are applied to prod only from `main` after merge (`pnpm db:migrate` run by Siavash, never from CI or a preview). Test data must be clearly named (`test-…`) and cleaned up. Revisit if a second developer joins.

## Hosting & domains

- `hampaclub.com` → Vercel, `www` redirects to apex (pick one, state it in README, keep it).
- DNS: Resend domain verification (SPF/DKIM) on `hampaclub.com`; Supabase custom SMTP → Resend.
- Supabase region **must** be eu-central-1 at creation (cannot change later).
- Vercel Function Region `fra1` set before first deploy.

## PWA

- `manifest.ts`: name "Hampa", short_name "Hampa", `display: standalone`, theme colours from tokens, icons 192/512 + maskable, `dir` set per locale at runtime via `<html dir>`.
- Serwist: precache app shell, network-first for tRPC, cache-first for fonts/icons. Push handler shows the notification and deep-links.
- Install prompt banner on 2nd visit (dismissable, remembered in localStorage).

## Mobile later (Phase 3)

Expo/React Native app consuming the same tRPC router via a bearer token path (verified by Supabase, as in FocusCrew B0). When that starts, extract `src/lib/validation`, types, and tokens into `@hampa/shared`. Not before.
