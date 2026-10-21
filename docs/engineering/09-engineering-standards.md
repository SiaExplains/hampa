---
title: Engineering Standards
type: standard
status: locked
updated: 2026-10-20
---

# Engineering standards

## Non-negotiables

1. TypeScript strict; no `any` to silence errors; no disabled lint rule without a `// why:` comment.
2. **Typecheck + lint + tests + build pass locally before "done".** Then boot `next dev` and smoke the routes the change touched, in `fa` and one LTR locale, at 375px.
3. Semantic tokens only in components (colours, spacing, radius from `tokens.css` / Tailwind theme). No raw hex.
4. No new dependency outside `06-architecture.md` without asking.
5. Schema lives in `src/db/schema`; never create or alter tables in the Supabase dashboard.
6. Logical CSS properties only (RTL). `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-` fail lint.
7. XP/GEM/level/streak only via `src/server/gamification`. No other module writes to the ledgers.
8. Every mutation calls `can()`.

## Versioning — every change bumps the version

- `package.json` `version` is the app version, shown in the footer and in `/api/health`.
- Semver: **patch** for fixes/copy, **minor** for a feature or schema change, **major** only for the launch (`1.0.0`) and later breaking relaunches.
- Each PR bumps the version in its last commit; `CHANGELOG.md` in the repo gets a line under the new version. Tag `v{version}` on merge to `main` (manual `git tag` + push, no release workflow — saves CI).

## Git flow

- `main` is deployable. **Never commit to `main` directly.**
- Branch `feat/h3-events`, `fix/…`, `chore/…` → PR → Vercel preview → review → squash-merge.
- Commit/push/merge only after Siavash explicitly says so (three stops: plan → review → git).
- PR description: what, why, how verified, version bump, anything guessed.

## CI budget (GitHub Actions)

The repo is public (Actions minutes are free for public repos), but keep it lean anyway:

```yaml
# .github/workflows/ci.yml
on:
  pull_request:
    branches: [main]
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  check:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - checkout · setup-node 22 (cache: pnpm) · pnpm i --frozen-lockfile
      - pnpm lint && pnpm typecheck && pnpm test && pnpm check:i18n && pnpm build
```

- **One job, PRs only** (no `push` trigger — Vercel builds `main` anyway).
- `timeout-minutes: 10`, `cancel-in-progress`.
- **No `schedule` workflows, ever.** Cron work runs on Vercel (`06-architecture.md`).
- No deploy workflow — Vercel Git integration deploys previews and production.
- Dependabot: security updates only.
- Docs-only PRs (`docs/**`, `*.md`) skip the heavy steps **inside** the job, not via `paths-ignore`: `check` is a required status on `main`, and a path-filtered workflow never reports, which would block the merge.

Build with dummy env values in CI (`.env.ci` committed, no secrets) so `next build` passes without touching Supabase.

## Testing

Thin and targeted, matching Vitest (+ `@testing-library/react` where needed). Priority:

| Layer | What |
|---|---|
| Unit (must) | level curve, tier mapping, streak (year boundary, DST), idempotent awards, void nets zero, elder window, invite expiry, waitlist promotion order, QR token window, permission matrix (`can()` table-driven test) |
| Integration (should) | tRPC routers against a local Postgres (`docker run postgres:16` or Supabase CLI) for: signup+approval, event register/waitlist, attendance → stats, erasure per-table rules |
| E2E (few, Playwright, local only — not in CI) | invite → signup → approve → register → coach checklist → profile shows XP |
| Manual | RTL screens, PWA install, push on a real Android + iOS |

## Code style

Prettier (with `prettier-plugin-tailwindcss`) decides formatting. Named exports. Colocate component + test. Comment the *why*, especially tunable numbers (point to `05-gamification.md`). Server code in `src/server/<domain>/` as plain functions; routers are thin.

## Definition of done (per build phase)

- "Done when" from `10-build-plan.md` verified by running it.
- Lint, typecheck, tests, i18n check, build pass.
- Smoke-tested in `fa` + `en` at 375px and desktop.
- No red/punitive UI in failure states.
- `.env.example` updated if a variable was added.
- Version bumped, `CHANGELOG.md` line added.
- `../../changelog.md` (vault) gets a dated line; `../../context.md` refreshed.
