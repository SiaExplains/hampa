---
title: Claude Code Workflow
type: standard
status: locked
updated: 2026-10-20
---

# How to run a Claude Code session on Hampa

Rule 0: **one phase per session, one PR per phase.** Paste the bootstrap prompt (or rely on `CLAUDE.md`, which says the same), then a ten-line phase prompt. Review after each phase.

## Bootstrap prompt (also the content of `CLAUDE.md`)

```
## Project
Hampa — HampaClub.com, the members-only web app (PWA) for the Hampa sports
community in Berlin (~944 members, 10 sports, volunteer coaches). Non-commercial.
Owner & only developer: Siavash (principal engineer; skip beginner explanations).

## Read first, in this order
docs/engineering/00-handbook-index.md   — locked decisions
docs/engineering/01-product-scope.md    — what Phase 1 is and is NOT
docs/engineering/10-build-plan.md       — the phase you are asked to do
then the specific files the phase references (data model, features, gamification…).
Where docs conflict, 00-handbook-index.md wins, then the newest file.

## Locked (do not re-litigate)
- Phase 1 = web PWA only. No Expo/native. No feed, chat, logging, badges, leaderboards, health, map, AI, payments.
- Stack: Next.js App Router + TS strict + Tailwind + shadcn/ui + tRPC v11 + Drizzle + Supabase (Auth/Postgres/Storage, eu-central-1) + Vercel (fra1) + Resend + Web Push + next-intl + Serwist. pnpm.
- Persian (fa) is the default locale, RTL-first; en and de equal. Logical CSS only.
- XP/GEM/level/streak computed server-side only, in src/server/gamification.
- Membership invite-only with approval; roles per 02-roles-and-permissions.md; every mutation calls can().
- Schema only via Drizzle migrations. RLS deny-all. Service-role key server-only.
- GitHub Actions: one PR-only job. No scheduled workflows. Cron = Vercel Cron.
- Hampa is not a legal entity; legal pages name the owner personally.

## Repo & access
- github.com/SiaExplains/hampa (public). Branch per phase: feat/h3-events → PR to main. Never commit to main.
- You have no production secrets. Keep .env.example with NAMES only. If a step needs a real key, stop and say which.
- Local clone: ~/Areas/Communities/Hampa/hampa-src (excluded from Syncthing).

## Working agreement (three approval stops)
1. Present a short plan for the phase → wait for "go".
2. Build. Lint + typecheck + test + check:i18n + build must pass. Boot `pnpm dev` and smoke the touched routes in fa and en at 375px.
3. Show results (what changed, acceptance test output, screenshots) → wait for review.
4. Only on explicit confirmation: commit, push, open PR. Never merge yourself.
- Bump package.json version (semver) and add a CHANGELOG.md line in every PR.
- Don't add dependencies outside 06-architecture.md without asking.
- Don't build anything outside this session's phase, even if it's in Phase 1.
- Don't invent product decisions; if the docs are silent, ask.

## Report format
Short. What changed · acceptance result · what you guessed · version. No essays.
```

## Phase prompt (one per session)

```
## This session: Phase H3 — Events, registration, waitlist, notifications
Follow docs/engineering/10-build-plan.md § H3. Implements F6 and F12 from 04-features-phase-1.md.
Read 03-data-model.md (events, event_registrations, notifications*) and 06-architecture.md (cron section) before coding.

## Done when
[paste the "Done when" from the build plan]

## Explicitly NOT in this session
Attendance/QR (H4), matches (H5), push (H8).

## Show me
Acceptance flow driven through the UI against a local Postgres (and prod only after merge), screenshots in fa + en at 375px, test output, version bump.
```

## What not to put in prompts

Re-explanations of the product · the big feature list (`12-later-phases.md`) · "make it production-ready" · real keys · more than one phase.

## Session end checklist

1. PR open (after approval), version bumped, `CHANGELOG.md` updated.
2. Append a dated line to `~/Areas/Communities/Hampa/changelog.md`; refresh `context.md` (current phase, what's open).
3. Anything guessed or deferred → `12-later-phases.md` or the build plan's phase notes.
