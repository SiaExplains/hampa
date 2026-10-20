---
title: Hampa Engineering Handbook — Index
type: index
status: locked
updated: 2026-10-20
---

# Hampa Engineering Handbook

The single source of truth for building **HampaClub.com** — the app for the Hampa sports community in Berlin. Written to be handed to Claude Code (or any engineer) one phase at a time.

Product context (community, people, Verein plans) lives one level up in `../master-context.md` and `../../context.md`. This folder is only about **what to build and how**.

## Reading order

| # | File | Read when |
|---|---|---|
| 1 | `01-product-scope.md` | Always first. What Hampa is, what Phase 1 is, what it is **not**. |
| 2 | `02-roles-and-permissions.md` | Before any feature touching auth, admin, invites, events. |
| 3 | `03-data-model.md` | Before any schema or query work. The authoritative table list. |
| 4 | `04-features-phase-1.md` | The feature specs with flows and acceptance criteria. |
| 5 | `05-gamification.md` | XP, levels, tiers, streaks, GEMs, elder status — all formulas. |
| 6 | `06-architecture.md` | Stack, repo layout, API design, hosting, env vars. |
| 7 | `07-i18n.md` | Persian-first, RTL, three locales. |
| 8 | `08-gdpr-and-security.md` | Consent, erasure, data location, anti-cheat. |
| 9 | `09-engineering-standards.md` | Definition of done, versioning, CI budget, testing. |
| 10 | `10-build-plan.md` | Phases H0–H10, one coding session each, with "Done when". |
| 11 | `11-claude-code-workflow.md` | The bootstrap prompt and the per-phase prompt. |
| 12 | `12-later-phases.md` | Everything from the big feature list that is deliberately not Phase 1. |
| — | `CLAUDE.md` | Copy to the repo root. Short; points back here. |

## Locked decisions (do not re-litigate in a coding session)

1. **Phase 1 = web PWA only.** Native iOS/Android come later on the same API (`12-later-phases.md`).
2. **Phase 1 scope = events + profiles + gamification + invite-only membership.** No feed, no chat, no activity logging, no health section, no badges wall. Chat stays in Telegram.
3. **Stack:** Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · tRPC · Drizzle · Supabase (Auth + Postgres + Storage, **eu-central-1**) · Vercel (**fra1**) · Resend · GitHub. Single repo `SiaExplains/hampa`.
4. **Persian is the default locale**, RTL-first. English and German are full equals in the UI.
5. **XP, GEMs, levels and streaks are computed server-side only.** No client can award itself anything.
6. **Membership is invite-only.** A regular member's invitee needs approval by an elder, coach, admin or owner. Admin/owner invites and the founding link skip approval.
7. **Berlin only for now, but no `city` hard-coding in business logic.** `sports`, `events` and `users` carry a `city_id` that is always Berlin in Phase 1. No city selector in the UI.
8. **Hampa is non-commercial and not (yet) a legal entity.** No payments, no pricing, no ads. Legal pages name Siavash personally until the e.V. exists.
9. **GitHub Actions budget:** one job, PRs only, cancel-in-progress, no scheduled workflows. Keep-alive and nightly jobs run on **Vercel Cron**.

## Who is who

- **Owner:** Siavash (product, infra, accounts).
- **Admins/coaches at launch:** see `../../context.md` (Sheida, Mohammad, Kaveh, Radin, Javad, Chia, Mona, Maryam).
- **Launch audience:** the ~944 members of the Hampa Telegram supergroup, onboarded via a founding invite link.

## How to change this handbook

A decision changes here first, then in code. Append a dated line to `../../changelog.md` and refresh `../../context.md`. Keep `status: locked` files stable; `draft` files are open to argument.
