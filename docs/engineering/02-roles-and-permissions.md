---
title: Roles & Permissions
type: reference
status: locked
updated: 2026-10-20
---

# Roles and permissions

Two axes: a **global role** on the user, and **per-sport coach** assignments. **Elder** is a computed status, not a role anyone assigns. There is exactly one owner.

## Global roles (`users.global_role`)

| Role | Who | Notes |
|---|---|---|
| `owner` | Siavash | Exactly one. Cannot be demoted via the app. Superset of admin. |
| `admin` | Sheida, Javad, Mohammad, … | Promoted/demoted only by owner. Platform-wide. |
| `member` | everyone else | Default on signup. |

## Per-sport role (`sport_coaches`)

| Role | Scope |
|---|---|
| `coach` | One sport. A user can coach several sports. Assigned by owner or admin. |

A sport **must** have ≥1 coach to be `active`. When the last coach is removed the sport becomes `suspended` automatically: it stays visible with a "looking for a coach" banner, existing events remain, no new events can be created. Target is 2 coaches per sport (governance decision), enforced as a dashboard warning, not a constraint.

## Computed status

| Status | Rule (configurable, see `05-gamification.md`) | Grants |
|---|---|---|
| `elder` | ≥ 10 recorded attendances in the last 180 days | Approve pending signups |

## Account status (`users.status`)

`pending_approval` → `active` → (`suspended` \| `deleted`). A `pending_approval` user can log in and see only a "waiting for approval" screen plus the rules.

## Permission matrix

✅ = allowed · 🟡 = allowed within own scope · — = not allowed

| Action | Owner | Admin | Coach (of sport S) | Elder | Member | Pending |
|---|---|---|---|---|---|---|
| Promote/demote admin | ✅ | — | — | — | — | — |
| Create sport | ✅ | — | — | — | — | — |
| Edit sport settings (XP values, `supportsMatches`, names) | ✅ | ✅ | — | — | — | — |
| Assign/remove coach | ✅ | ✅ | — | — | — | — |
| Suspend/reactivate user | ✅ | ✅ | — | — | — | — |
| Delete another user (GDPR request) | ✅ | ✅ (step-up auth) | — | — | — | — |
| Adjust XP/GEM manually (audited) | ✅ | ✅ | — | — | — | — |
| Publish new rules version | ✅ | ✅ | — | — | — | — |
| Invite without approval | ✅ | ✅ | — | — | — | — |
| Create founding link | ✅ | — | — | — | — | — |
| Invite with approval | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Approve/reject pending signup | ✅ | ✅ | ✅ | ✅ | — | — |
| Create/edit/cancel event | ✅ | ✅ | 🟡 sport S | — | — | — |
| Record attendance (checklist, override) | ✅ | ✅ | 🟡 own events in S | — | — | — |
| Show check-in QR | ✅ | ✅ | 🟡 own events in S | — | — | — |
| Record match result | ✅ | ✅ | 🟡 events in S | — | — | — |
| Register for event | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| QR self check-in | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Follow/unfollow | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Join/leave sport | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| View member profiles | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Export own data / delete own account | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View audit log | ✅ | ✅ | — | — | — | — |

Approving a signup: the approver must not be the inviter (four-eyes), unless approver is admin/owner.

## Implementation rules

1. Authorization is a single server-side helper: `can(actor, action, resource)` in `src/server/auth/permissions.ts`. Every tRPC procedure calls it. No permission logic in React.
2. Role and coach changes write to `audit_log`.
3. The owner is identified by `users.global_role = 'owner'` **and** a `HAMPA_OWNER_EMAIL` env check at bootstrap (seed), so a DB mistake can't lock the owner out.
4. UI hides what the user can't do; the server still enforces it. Hidden ≠ secured.
