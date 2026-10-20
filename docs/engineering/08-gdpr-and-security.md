---
title: GDPR, Datenschutz & Security
type: standard
status: locked
updated: 2026-10-20
---

# GDPR / Datenschutz and security

Hampa processes personal data of EU residents from day one. It is non-commercial and not a legal entity, which changes **who is responsible** (Siavash personally, as Verantwortlicher under Art. 4(7) DSGVO) — not **whether** DSGVO applies. Not lawyer-reviewed; this is the engineering position.

## Responsible party & legal pages

Until the e.V. exists:
- **Impressum** (§ 5 DDG / § 18 MStV): Siavash Ghanbari Hamzehkolaei, postal address, email. Kept in `src/i18n/messages` per locale and in `/legal/impressum`. Phone number optional — don't publish it unless you want to.
- **Datenschutzerklärung** at `/legal/privacy`, three locales, lists every processor below, purposes, retention, rights, and the Berlin supervisory authority (Berliner Beauftragte für Datenschutz und Informationsfreiheit).
- **Terms / Nutzungsbedingungen** at `/legal/terms`: invite-only membership, Hampa Rules reference, no warranty, no cost, account termination.
- When the Verein is registered, swap the responsible party in one place and bump the legal document version → re-consent modal.

## Processors (DPA / AVV required — sign the standard ones in each dashboard)

| Processor | Data | Region |
|---|---|---|
| Supabase | all app data, auth, avatars | **eu-central-1 Frankfurt** — must be chosen at project creation |
| Vercel | request logs, function execution | Function region `fra1`; edge/CDN global (standard contractual clauses) |
| Resend | email addresses, email content | US company, EU data residency option — enable EU region if offered; otherwise SCCs via their DPA |
| cron-job.org (if used for the pinger) | none (it only hits a URL with a secret) | — |
| Google (only if OAuth enabled later) | identity | SCCs |

No analytics, no ad pixels, no third-party fonts (self-hosted), no Google Maps embed (plain link only), no CDN-loaded scripts.

## Lawful bases

| Processing | Basis |
|---|---|
| Account, profile, events, attendance, gamification | Art. 6(1)(b) — necessary for the membership agreement the user enters at signup |
| Transactional email (approval, reminders for events you registered for) | Art. 6(1)(b) |
| Push notifications | Art. 6(1)(a) consent — browser permission + explicit toggle |
| Non-essential email (new events in a joined sport, level-ups) | Art. 6(1)(a) consent — preferences default **on** for event announcements in joined sports (the user explicitly joined the sport), **off** for social/level emails; every email has a one-click preferences link |
| Audit log, abuse prevention | Art. 6(1)(f) legitimate interest |
| Telegram handle | voluntary, user-provided, deletable anytime |

## Data minimisation (what we deliberately do not store)

- No IP addresses or user agents in app tables (Supabase auth logs keep theirs for 7 days — out of our hands).
- No GPS/location of users. Check-in is QR, not geolocation.
- No birthdate, gender, photos other than one avatar, no health data. **If someone adds a "health" feature later, this file is the gate.**
- Event location is the venue, not the user.

## Consent records

Signup requires two separate, unticked checkboxes (rules, privacy) → two `consents` rows with version, timestamp, locale. New major rules version → blocking re-consent. Consent withdrawal = account deletion (membership requires the rules).

## Rights — implemented as features

| Right | Implementation |
|---|---|
| Access / portability (Art. 15, 20) | `account.export`: JSON of users, consents, registrations, attendances, matches, xp/gem ledgers, follows, notifications, preferences. Emailed link, 24h expiry, generated server-side |
| Erasure (Art. 17) | `account.delete` self-service + admin erase (step-up). Rules per table in `03-data-model.md` → own content deleted, attendance/match/ledger rows kept but anonymised (needed for other members' consistent history; legal basis Art. 17(3)(b)/(f) is thin — the handbook position is: anonymisation of statistical rows is sufficient because no identifier remains) |
| Rectification | profile edit |
| Objection to non-essential processing | notification preferences |

Erasure must complete in **one transaction**, delete the `auth.users` row via the admin API, sign out all sessions, and send a plain confirmation email to the pre-deletion address (then forget it).

## Retention

| Data | Retention |
|---|---|
| Notifications | 90 days, then nightly purge |
| Expired/used invites | 180 days |
| Push subscriptions | deleted on 410/404 from push service |
| Audit log | 2 years |
| Export files | 24 h |
| Everything else | lifetime of the account |

## Security

1. **Server-side only awards.** XP/GEM/level/streak are never client-trusted (`05-gamification.md`).
2. **RLS on every table, deny-all**, so the anon key is harmless; service-role key only in server code; never in `NEXT_PUBLIC_*`.
3. **Public repo hygiene:** `.env*` ignored, `gitleaks` pre-commit hook (local, free), no secrets in CI (CI needs none — it runs lint/typecheck/test/build with dummy env).
4. **Authorization:** one `can()` helper; every mutation calls it; admin erase and role changes need step-up auth.
5. **QR check-in:** secret per event + 5-minute rolling token; rate limit `checkin` to 10/min per user; window-bounded.
6. **Invites:** 12-char random codes, expiry, single-use; `resolve` rate-limited per IP at the edge (Vercel's basic limiter or a tiny in-memory token bucket per function instance — good enough at this scale).
7. **Uploads:** avatar type/size validated server-side, re-encoded to WebP on upload, EXIF stripped (GPS in photos!).
8. **Headers:** CSP (self + Supabase + Vercel), HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, no third-party frames.
9. **Members-only:** nothing except legal pages, login, invite landing and the check-in redirect is reachable unauthenticated. Profiles are not indexable (`noindex` + behind auth).
10. **Dependencies:** Dependabot security updates only (not version bumps — keeps PR noise and CI minutes down).

## Open legal items (owner's list, not engineering)

- Sign DPAs: Supabase, Vercel, Resend.
- Decide whether to publish a phone number in the Impressum.
- Have Datenschutzerklärung reviewed once the e.V. exists.
