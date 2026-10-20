---
title: Features — Phase 1
type: spec
status: locked
updated: 2026-10-20
---

# Phase 1 feature specs

Each feature: flow → rules → acceptance. Numbered `F1…F14`; the build plan references these numbers.

## F1 — Signup via invite

**Flow**
1. User opens `hampaclub.com/i/<code>` (or clicks the email). Page shows inviter name, Hampa one-liner, locale switch.
2. Creates account: email + password **or** magic link. Username, display name, locale.
3. Must tick two separate checkboxes: (a) "I have read and accept the Hampa Rules v{x}" (link opens the rules in-app), (b) "I accept the privacy policy". Both recorded in `consents`.
4. Account created with `status`:
   - `active` if invite `kind ∈ {admin, founding}`
   - `pending_approval` if `kind = member`
5. Pending users see a waiting screen; approvers get an in-app + email notification.

**Rules**
- No invite code → no signup form. `/signup` without a code shows "Hampa is invite-only — ask a member."
- Invite `member`/`admin`: single use, 14-day expiry. `founding`: multi-use with `max_uses` and `expires_at` set by owner.
- Email invites send via Resend with the same code. Email is not pinned: whoever opens the link uses it.
- One account per `auth.users` email. Google OAuth: later, toggle in Supabase dashboard.
- Inviter earns 1 GEM when the invitee becomes `active` (idempotent on `invite_id`).

**Acceptance**
- Member invite → signup → appears in approver queue → approve → user active, inviter has +1 GEM, invitee gets email.
- Admin invite → signup → active immediately.
- Expired/used code → clear message, no form.
- Consent rows exist with correct version + locale.

## F2 — Approval queue

Visible to elder/coach/admin/owner at `/admin/approvals`. Shows pending users with inviter, time waiting, locale. Approve / reject (reject requires short reason, shown to inviter not invitee). Four-eyes: inviter can't approve their own invitee unless admin/owner. Auto-reminder email to approvers if queue has items older than 48h (Vercel Cron, daily).

## F3 — Founding migration

Owner creates a `founding` invite (max_uses e.g. 1500, expiry e.g. 30 days) at `/admin/invites`. Posts link in Telegram. Signups through it are `active` immediately, `invited_by = owner`, **no GEM awarded** (not a personal invite). Owner can revoke the link at any time. Dashboard shows uses.

## F4 — Profile

Public to all active members (not to the internet — everything is behind auth).

Shows: avatar, display name, @username, bio, Telegram handle (link `t.me/…`, optional), sports joined with per-sport level, global level + tier + XP progress bar, current streak + longest, GEMs, elder badge, attendance count, "follows you" indicator, follow button, follower/following counts, recent attended events (last 10, event title + sport + date).

Edit own: display name, bio, avatar (crop client-side, ≤ 2 MB, `avatars` bucket), Telegram handle, locale, notification preferences. Username changeable once.

## F5 — Sports

`/sports` lists all sports with coach avatars, member count, next event, status banner if suspended. `/sports/[slug]` shows description, coaches, upcoming events, members (sorted by sport level), and a Join/Leave button.

Owner creates sports at `/admin/sports`; admin edits settings and assigns coaches. Removing the last coach → `suspended` + banner "Looking for a coach — talk to an admin". Suspended sports accept no new events.

## F6 — Events

**Create/edit (coach of the sport, admin, owner):** title, description, start, end (default +2h), location name, map link, capacity (optional), status draft/published. Publishing notifies sport members (in-app + email + push per preferences).

**Event page:** sport, time (localised), location, coach(es), capacity bar, attendee avatars (people you follow first), Register / Leave / Join waitlist button, "Add to calendar" (ICS download), cancellation notice if cancelled.

**Registration rules**
- Active members only. One registration per user per event.
- If capacity reached → `waitlisted` with position. When someone leaves, first waitlisted becomes `registered` and is notified.
- Registration closes at `starts_at`. Leaving after `starts_at − 2h` is allowed but flagged as late in the coach view (no penalty in Phase 1).
- Overlapping events are fine; a user can register for several.

**Lifecycle**: `draft` → `published` → (`cancelled` | `completed`). `completed` set by coach ("Close event") or by cron 24h after `ends_at`. Cancelling notifies registrants with the reason.

**Reminders**: 24h and 2h before `starts_at` to registered users (email + push per preferences). Implemented as a Vercel Cron running every hour (Hobby allows daily; see `06-architecture.md` for the workaround) — reminder idempotency via `notifications` rows keyed `(user, event, kind)`.

**Home (`/`)**: "This week in Hampa" — upcoming events in joined sports, then other sports; registered events highlighted; streak status strip.

## F7 — Attendance

Two sources, same table, same XP:

**A. Coach checklist** — on the event page from `starts_at` onward, coach sees the registered list + "add walk-in" search; ticks who attended. Saving writes `attendances(source = coach)` and awards XP. Unticking after save → `voided_at` + compensating negative `xp_events` row. 

**B. QR self check-in** — coach taps "Show check-in QR"; page renders a QR of `hampaclub.com/checkin/<eventId>/<checkin_secret>` that refreshes every 60s (secret stays, a timestamp token is appended and verified within ±5 min to stop screenshots being forwarded). Member scans with phone camera → logged-in page → "You're checked in ✓". Valid only in `[checkin_opens_at, checkin_closes_at]`. Writes `attendances(source = qr)`.

**Rules**
- Attendance requires an active account; registration is **not** required (walk-ins count).
- One attendance per (event, user). Second scan → "already checked in".
- Coach can void any attendance on their event; admin can void anywhere. Voids are audited.
- Organizer XP: each coach listed on an event (creator + any co-coach added) gets `xp_organizer` when the event is `completed` with ≥ 2 attendances.

**Acceptance**
- Coach ticks 5 people → 5 attendance rows, 5 XP rows of `xp_attendance`, stats caches updated, streak updated.
- QR scanned 10 min before start → accepted. Scanned next day → rejected.
- Void → XP net zero, stats recomputed.

## F8 — Matches (sports with `supportsMatches`)

Inside a completed-or-live event, coach taps "Record match": format (1v1/2v2/team), pick players from attendees, mark winners. Saves `matches` + `match_players`, awards `xp_match_win` to winners (idempotent per match+user). Editable within 48h by the recorder; deletion reverses XP. Shown on the event page and on player profiles ("matches won").

## F9 — Gamification (see `05-gamification.md` for formulas)

- Per-sport XP → sport level.
- Global XP (sum) → global level → tier.
- Weekly streak (Mon–Sun Berlin): ≥1 attendance.
- GEMs: +1 per completed personal invite.
- Elder: computed nightly.
- All recomputation is one server function `recomputeUserStats(userId)` called after every ledger write and by the nightly cron.
- Level-up and tier-up create an in-app notification (and push if enabled). Streak break creates **no** notification.

## F10 — Follow

Follow/unfollow from profile or attendee list. Effect in Phase 1: followed people sort first in attendee lists and in the sport member list; profile shows mutual-follow. No feed, no notification on follow (keeps it low-pressure). Data is there for later.

## F11 — Rules

`/rules` renders the current `rules_versions` in the user's locale (fallback en), with PDF download. Admin publishes a new version at `/admin/rules`; if `requires_reconsent`, every active user sees a blocking modal on next visit until they accept. Consent recorded per version.

## F12 — Notifications

Inbox at `/notifications` (bell with unread count). Types: `signup.pending` (approvers), `signup.approved`, `event.published`, `event.updated`, `event.cancelled`, `event.reminder_24h`, `event.reminder_2h`, `waitlist.promoted`, `level.up`, `tier.up`, `gem.earned`, `rules.new`. Each type maps to channels via `notification_preferences`. Email templates via Resend (React Email), three locales. Push via Web Push (VAPID). Every email carries a one-click preference link.

## F13 — Admin area

`/admin` (admin, owner): approvals, invites, users (search, role, status, coach assignments, suspend, erase with step-up), sports, rules, audit log, XP/GEM adjustment with mandatory note. `/admin/users/[id]` shows the user's ledgers. Owner-only: promote/demote admin, founding link.

## F14 — Account & GDPR self-service

`/settings/account`: change email/password, export my data (JSON zip generated server-side, emailed as link valid 24h), delete my account (type username to confirm → erasure per table rules → signed out → confirmation email). Legal pages: `/legal/impressum`, `/legal/privacy`, `/legal/terms` in three locales.
