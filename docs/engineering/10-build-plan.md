---
title: Build Plan — Phases H0–H10
type: plan
status: locked
updated: 2026-10-20
---

# Build plan

One phase = one Claude Code session = one PR. Each has a **Done when** that is verified by running, not by reading. Don't start the next phase until the current one is merged. Feature numbers refer to `04-features-phase-1.md`.

Prerequisites (owner, before H0): Supabase project `hampa-prod` (created as `hampa`) in **eu-central-1** (no staging); Vercel project with Function Region **fra1**; `hampaclub.com` DNS to Vercel; Resend account + domain verified; a `hampa.club.info@…` style mailbox for vendor signups; VAPID keypair generated (`npx web-push generate-vapid-keys`).

## H0 — Scaffold, i18n, theme, deploy

1. `pnpm create next-app` (App Router, TS, Tailwind, ESLint, `src/`), pnpm, Prettier + tailwind plugin, Husky pre-commit (lint-staged: eslint + prettier + gitleaks).
2. `next-intl` with `[locale]`, `fa` default, `localePrefix: 'always'`; `html dir`; messages skeleton for three locales + `scripts/check-i18n.ts`.
3. Fonts: Vazirmatn + Inter self-hosted; `tokens.css` (light/dark, warm palette per brand note); shadcn init on tokens; dark mode class-based, system default.
4. ESLint rule banning physical direction utilities.
5. `/api/health` returning `{ status, version, database: 'not_configured' }`.
6. `CHANGELOG.md`, version `0.1.0`, `CLAUDE.md`, `docs/engineering/` copied in.
7. CI workflow per `09-engineering-standards.md`; `.env.ci`.
8. Deploy: Vercel preview + production on `hampaclub.com`.

**Done when:** `hampaclub.com/fa` renders an RTL placeholder home in Vazirmatn, `/en` LTR in Inter, dark/light toggle works, `/api/health` returns the version, CI is green on the PR.

## H1 — Database, auth, users, consent, invites, approval (F1, F2, F3)

1. Drizzle + `postgres-js`; `DATABASE_URL`/`DIRECT_URL`; schema for `cities, users, invites, consents, rules_versions, audit_log, notifications, notification_preferences`; RLS deny-all migration; trigger `auth.users → public.users`.
2. Supabase Auth with `@supabase/ssr`: login (password + magic link), forgot password, logout; custom SMTP → Resend; auth email templates in three locales.
3. Middleware: session refresh, locale, auth redirects, `pending_approval` → `/waiting`.
4. tRPC setup, context, `can()` with table-driven test.
5. Invite landing `/i/[code]`, signup form with two consent boxes, `completeSignup`.
6. Approval queue `/admin/approvals`, approve/reject, notifications (in-app + email).
7. `/admin/invites`: create member/admin invite (link + optional email), founding link (owner), revoke, usage.
8. Seed: Berlin, owner user (from `HAMPA_OWNER_EMAIL`), rules v1.0.1 from `governance/Group-Rule-V1.0.1.pdf` (upload to `documents` bucket, markdown body to be pasted by owner).
9. GEM ledger table + `invite_completed` award on activation (idempotent).

**Done when:** member invite → signup (fa) → pending → admin approves → user lands on home, inviter has 1 GEM, both consent rows exist; admin invite skips approval; founding link with max_uses=2 stops at the third use; expired code shows the friendly error.

## H2 — Sports, coaches, admin basics (F5, F13 part)

1. Schema: `sports, sport_coaches, sport_members`; seed the 10 sports with translations, `supports_matches`, featured flags.
2. `/sports`, `/sports/[slug]`, join/leave.
3. `/admin/sports`: create (owner), edit, assign/remove coach; auto-suspend on last coach removal; banner.
4. `/admin/users`: search, role promote/demote (owner), suspend, coach list; audit log writes + `/admin/audit`.
5. Profile basics `/u/[username]` + `/settings/profile` (avatar upload to Storage with WebP re-encode + EXIF strip).

**Done when:** owner creates "Running", assigns two coaches, a member joins it and appears in the member list; removing both coaches suspends the sport and hides "create event" for everyone; every role change is in the audit log.

## H3 — Events, registration, waitlist, notifications (F6, F12)

1. Schema: `events, event_registrations, push_subscriptions`.
2. Coach event form (create/edit/publish/cancel/close), `checkin_secret` generation, ICS endpoint.
3. Event page, home "This week", register/leave/waitlist with promotion.
4. Notification dispatcher: type → channels by preferences; in-app inbox; React Email templates (fa/en/de) for `event.published`, `event.cancelled`, `waitlist.promoted`, `signup.*`.
5. Nightly cron route (`/api/cron/nightly`) with `CRON_SECRET`: close events, expire invites, keep-alive, pre-compute reminders; `/api/cron/deliver` for the external pinger; `vercel.json` cron entry.
6. Settings → notification preferences.

**Done when:** coach publishes an event with capacity 2 → three members register, third is waitlisted → one leaves → waitlisted is promoted and emailed → event appears on home for sport members only → cancel sends the reason; reminders are queued with correct `deliver_at` in Berlin time.

## H4 — Attendance + XP ledger (F7, F9 core)

1. Schema: `attendances, xp_events, user_sport_stats, user_stats`.
2. `src/server/gamification`: config, `xpForLevel/level`, tiers, streak, `recomputeUserStats` — **with the unit tests from `05-gamification.md` §9**.
3. Coach checklist UI (registered + walk-in search), save → attendance + XP in one transaction; void with compensation.
4. QR: coach "Show QR" page (rolling token), `/checkin/[eventId]/[token]` handler, success/failure screens, window checks, rate limit.
5. Organizer XP on close.
6. Profile shows sport levels, global level/tier, XP progress, streak, attendance history.

**Done when:** checklist of 5 → 5 attendance + XP rows, stats and streak correct; QR scan 10 min before start works, next day is refused; void nets zero; all gamification unit tests green; level-up notification arrives.

## H5 — Matches (F8)

1. Schema: `matches, match_players`.
2. Record-match UI inside event (sports with `supports_matches`), winners get XP idempotently, edit within 48h, delete reverses.
3. Profile: matches played/won per sport; event page: match list.

**Done when:** a 2v2 badminton match recorded → both winners +5 XP in Badminton only, visible on profiles; deleting the match removes it.

## H6 — Follow, elder, GEM display, streak polish (F10, F9 rest)

1. Schema: `follows`. Follow/unfollow, counts, "follows you", followed-first sorting in attendee and member lists.
2. Elder computation (nightly + on attendance) and approval right for elders.
3. GEM balance on profile; `/admin` XP/GEM adjust with note.
4. Streak strip on home ("5 weeks · attend this week to keep it"); Monday reset verified across DST change in tests.

**Done when:** a member with 10 attendances in 180 days becomes elder overnight and can see `/admin/approvals`; following reorders lists; manual XP adjustment appears in ledger + audit.

## H7 — Rules & consent lifecycle (F11)

1. `/rules` page (markdown per locale + PDF), `/admin/rules` publish new version with `requires_reconsent`.
2. Blocking re-consent modal; consent rows.
3. Legal pages `/legal/impressum|privacy|terms` in three locales (owner supplies final text; engineer ships structure + placeholders clearly marked).

**Done when:** publishing v2.0.0 forces every active user through the modal once; v2.0.1 (no reconsent) does not.

## H8 — PWA + Web Push

1. Serwist: manifest, icons, offline shell, SW with push + notificationclick.
2. Push subscribe/unsubscribe in settings; `web-push` sender in dispatcher; purge dead subscriptions on 404/410.
3. Install banner.

**Done when:** installed on an Android phone and an iPhone (home screen), a test push for `event.published` arrives on both and opens the event.

## H9 — GDPR tooling & account (F14)

1. `account.export` (JSON zip, 24h signed link, email), `account.delete` (erasure per table, auth user removed, sessions revoked, confirmation email), admin erase with step-up.
2. Retention purges in nightly cron (notifications 90d, invites 180d, export files 24h).
3. Security headers (CSP, HSTS), `noindex` on app routes, gitleaks hook verified, Dependabot security-only config.

**Done when:** a seeded user with attendances and matches deletes their account → their rows are anonymised/deleted exactly per `03-data-model.md`, other members' match history still renders, the export zip opens and contains every listed table.

## H10 — Hardening, seed data, launch

1. Full RTL/375px pass on every screen; copy review in fa by Siavash/Sheida.
2. Load the real coaches as admins/coaches; import sports descriptions; rules v1.0.1 final text.
3. Rehearsal in production: founding link with 5 testers from the admin group, one real event with QR + checklist.
4. Version `1.0.0`, tag, production deploy, founding link posted in Telegram.

**Done when:** the first real event has attendance recorded in production and the profile of at least one coach shows a sport level > 1.

## Phase 1.5 — Telegram mirror (after launch)

Bot (grammY, as a Vercel route with webhook) posts to the sport's Telegram topic on `event.published` / `event.cancelled` with a deep link; optional `/events` command. Requires the bot to be admin in the supergroup and a `sports.telegram_topic_id` column.
