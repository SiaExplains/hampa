# Hampa — CLAUDE.md

HampaClub.com: members-only web app (PWA) for the Hampa sports community in Berlin. Non-commercial. Owner/developer: Siavash.

**The handbook is `docs/engineering/`. Read `00-handbook-index.md`, `01-product-scope.md`, then the phase in `10-build-plan.md` you are asked to do. `00-handbook-index.md` wins on conflicts.**

## Locked
- Phase 1 = web PWA only. No native. No feed/chat/logging/badges/leaderboards/health/map/AI/payments.
- Next.js App Router · TS strict · Tailwind + shadcn/ui · tRPC v11 · Drizzle · Supabase (Auth/Postgres/Storage, eu-central-1) · Vercel (fra1) · Resend · Web Push · next-intl · Serwist · pnpm.
- `fa` default locale, RTL-first; `en`, `de` equal. Logical CSS utilities only (`ms-`, `pe-`, `start-`…).
- XP/GEM/level/streak are server-side only (`src/server/gamification`). Every mutation calls `can()`.
- Invite-only membership with approval (`02-roles-and-permissions.md`).
- Schema only via Drizzle migrations; RLS deny-all; service-role key never in `NEXT_PUBLIC_*`.
- CI: one PR-only GitHub Actions job, no `schedule` workflows. Cron = Vercel Cron.

## Working agreement
1. Plan → wait for "go". 2. Build; `pnpm lint && pnpm typecheck && pnpm test && pnpm check:i18n && pnpm build`; run `pnpm dev` and smoke touched routes in `fa` + `en` at 375px. 3. Show results → wait for review. 4. Commit/push/PR only on explicit confirmation. Never merge, never commit to `main`.
- Bump `package.json` version (semver) + `CHANGELOG.md` line in every PR.
- No dependencies outside `06-architecture.md` without asking. Nothing outside the current phase. Ask when docs are silent.
- No secrets: `.env.example` has names only. Say which key you need and stop.

## Commands
`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm check:i18n` · `pnpm build` · `pnpm db:generate` · `pnpm db:migrate` · `pnpm db:seed`

## Report
Short: what changed · acceptance result · what you guessed · version.
