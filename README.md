# Hampa

HampaClub.com — the members-only web app for the Hampa sports community in Berlin.

The engineering handbook lives in [`docs/engineering/`](docs/engineering/00-handbook-index.md); start there. [`CLAUDE.md`](CLAUDE.md) is the short version.

## Run it

Needs Node 22.18+ and pnpm 11.

```bash
pnpm install
pnpm dev            # http://localhost:3000 → redirects to /fa
```

Before a PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm check:i18n && pnpm build`.

The pre-commit hook runs lint-staged and a gitleaks secret scan; install gitleaks once with `brew install gitleaks`.

## Domain

Production is the apex `https://hampaclub.com`; `www.hampaclub.com` redirects to it.
