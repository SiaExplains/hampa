---
title: Product Scope — Phase 1
type: reference
status: locked
updated: 2026-10-20
---

# Product scope — Phase 1 (HampaClub.com web PWA)

## What Hampa is

**Hampa** (Persian: *someone who accompanies you*) is a Berlin sports community founded by Siavash in February 2024. Today it is a Telegram supergroup (~944 members) with one topic per sport, run by volunteer coaches. HampaClub.com turns that into a product: a members-only social layer for **doing sport together** — announce events, register, show up, and get recognised for consistency.

**One line:** Strava tracks what you did alone. Hampa is about who you did it with.

**Non-goals, permanently:** competing with Strava on tracking; monetisation before the community is served; anything that rewards output over showing up.

## Brand & tone (binding for all UI copy)

Warm, calm, human, inclusive. "Small steps matter." "You don't have to do it alone."
Never: hustle, shaming, "no excuses". Failure states are never red/punitive — a broken streak is a quiet reset, not a scolding.

## Users

- **Primary:** Persian-speaking expats and newcomers in Berlin, 25–45, who want consistency and company.
- **Secondary:** German- and English-speaking friends-of-members.
- **Operators:** ~9 volunteer coaches/admins who announce and run events every week.

## Phase 1 — what ships

| Area | In |
|---|---|
| **Membership** | Invite-only signup (link or email); approval flow; email+password and magic link; rules + privacy consent at signup; founding migration link for Telegram members |
| **Profiles** | Display name, username, avatar, bio, optional Telegram handle, sports followed, global level/tier, per-sport levels, streak, GEMs, attendance history, follower/following counts |
| **Sports** | Owner creates sports; each sport has ≥1 coach (target 2); members "join" a sport to see and be notified of its events; a sport can be suspended (no coach) but never deleted |
| **Events** | Coaches create/edit/cancel events per sport; capacity + waitlist; one-tap register/unregister; reminders 24h and 2h before; event page with attendee list |
| **Attendance** | Coach checklist after the event **and** QR self check-in at the venue; coach override; attendance is the only source of XP |
| **Matches** | For sports flagged `supportsMatches`, a coach records a match (1v1 / 2v2 / teams) inside an event; winners get bonus XP |
| **Gamification** | XP per sport, sport levels, global level + tiers (Rookie → Legend), weekly streak, GEMs for completed invites, elder status |
| **Social graph** | Follow/unfollow; "people you follow" visible on event attendee lists; no feed |
| **Rules** | Versioned Hampa Global Rules (PDF + markdown); consent recorded per version; re-consent on new major version |
| **Admin** | Owner: promote/demote admins, create sports, assign coaches. Admin: manage users, approve signups, suspend accounts, adjust XP with audit trail. Coach: everything inside their sport |
| **Notifications** | In-app inbox, email (Resend), web push (PWA) |
| **Platform** | PWA installable on iOS/Android home screen; three locales; dark/light |
| **GDPR** | Data export (JSON), self-service account deletion with anonymised attendance, Impressum/Datenschutz pages |

### Phase 1.5 (right after launch, cheap, high leverage)
- Telegram bot that mirrors new/updated events into the matching Telegram topic with a deep link.

## Phase 1 — explicitly out

No feed, posts, comments, reactions · no chat · no manual activity logging · no Strava/Health sync · no GPS (QR only) · no badges wall · no leaderboards · no challenges · no health/discussion section · no author role · no map discovery · no city selector · no payments · no native apps · no AI.

Each of these is listed with its intended later phase in `12-later-phases.md`. Naming an out-of-scope feature in a coding prompt invites building it — don't.

## Launch definition

Launch = the founding invite link is posted in the Telegram group and coaches announce the next week's events in the app instead of (or alongside) Telegram. Success in the first 8 weeks: ≥50% of active Telegram members have an account; every regular weekly event (Running, Badminton) is announced in-app and has attendance recorded.

## Sports at launch

Running (main) · Badminton (main) · Yoga · Basketball · Volleyball · Camping · Hiking · Table Tennis · Chess · Biking.

`supportsMatches = true` for Badminton, Table Tennis, Chess, Basketball, Volleyball.

## Geography

Berlin only. The schema has `cities`; the UI never shows a picker in Phase 1. Expansion order later: other German cities → EU.
