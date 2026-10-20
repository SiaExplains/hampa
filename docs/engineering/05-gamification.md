---
title: Gamification
type: spec
status: locked
updated: 2026-10-20
---

# Gamification — formulas and rules

Design stance: **reward showing up, not output.** Everything here is consistency-weighted and server-computed. Every number is a constant in `src/server/gamification/config.ts` with a comment saying where it came from; this file is the source for those comments.

## 1. XP

XP is only ever created by `xp_events` rows written by server code. Sources:

| Reason | Amount (default) | Trigger | Idempotency key |
|---|---|---|---|
| `attendance` | `sports.xp_attendance` (10) | attendance row inserted | `attendance:<eventId>:<userId>` |
| `match_win` | `sports.xp_match_win` (5) | match saved, per winner | `match:<matchId>:<userId>` |
| `organizer` | `sports.xp_organizer` (5) | event `completed` with ≥2 attendances, per coach on event | `event:<eventId>:<userId>` |
| `adjustment` | any (±) | admin with note | `manual:<uuid>` |

Voiding writes a negative row with the same `ref` and `reason = adjustment`, `note = 'void'`. Totals are always `SUM(amount)`.

XP is per sport. Global XP = Σ sport XP. Adjustments may be global (`sport_id = null`).

## 2. Levels

Same curve for sport level and global level. Cumulative XP needed to **reach** level `L` (L ≥ 1, level 1 = 0 XP):

```
xpForLevel(L) = round(12 * (L - 1) ^ 1.5)
level(xp)     = max L such that xpForLevel(L) <= xp
```

| Level | Cum. XP | ≈ attendances at 10 XP |
|---|---|---|
| 1 | 0 | 0 |
| 2 | 12 | 2 |
| 5 | 96 | 10 |
| 10 | 324 | 32 |
| 20 | 994 | 99 |
| 30 | 1,874 | 187 |
| 45 | 3,502 | 350 |
| 60 | 5,438 | 544 |
| 100 | 11,820 | 1,182 |

Sanity: someone running twice a week for a year (~100 attendances) is sport level ~20; after 3.5 years, ~45. Yoga once a month for a year → level ~5. Matches and organizing nudge this up, not dominate it.

Progress bar: `(xp - xpForLevel(L)) / (xpForLevel(L+1) - xpForLevel(L))`.

## 3. Tiers (global level only)

| Tier | Global level |
|---|---|
| Rookie | 1–9 |
| Amateur | 10–24 |
| Athlete | 25–49 |
| Elite | 50–99 |
| Legend | 100+ |

Tier names are translated (`fa`, `en`, `de`); keys are the English words in lowercase.

## 4. Weekly streak

- Week = ISO week in `Europe/Berlin` (Mon 00:00 → Sun 23:59:59).
- A week "counts" if the user has ≥ 1 non-voided attendance whose event `starts_at` falls in that week, in **any** sport.
- `current_streak_weeks` = number of consecutive counting weeks ending at the current or previous week.
  - During the current week, the streak is "alive" if last week counted (shown as e.g. "5 weeks · attend this week to keep it").
  - If the current week ends without attendance, the streak is 0 from Monday.
- `longest_streak_weeks` is never decreased.
- Recomputed on attendance insert/void and by the nightly cron (so Monday 00:05 Berlin resets stale streaks).
- **Streak insurance (schema-ready, not in Phase 1 UI):** `gem_events` reason `streak_insurance` spends GEMs to mark one missed week as counted. Reserved; do not build the UI yet.
- No notification, no red UI on a break. The profile just shows the new count.

## 5. GEMs

| Reason | Amount | Trigger | Key |
|---|---|---|---|
| `invite_completed` | +1 | invitee reaches `active` via a `member` or `admin` invite from this inviter | `invite:<inviteId>` |
| `streak_insurance` | −N | later | |
| `adjustment` | ± | admin with note | |

Founding-link signups award nothing. Banning/erasing the invitee later does **not** claw back the GEM.

`gems = SUM(gem_events.amount)`.

## 6. Elder status

```
is_elder = attendances in last 180 days (non-voided) >= ELDER_MIN_ATTENDANCES (10)
```

Recomputed nightly and on attendance insert. `elder_since` set on first true; cleared when false (so it is a live status, not a permanent rank). Profile shows a small "Elder" mark; `02-roles-and-permissions.md` gives elders the approval right.

## 7. Recompute function

`recomputeUserStats(userId)`:
1. Aggregate `xp_events` by sport → upsert `user_sport_stats` (xp, level, attended_count from `attendances`, matches from `match_players`).
2. Sum → `user_stats.xp_total`, `level`, `tier`.
3. Streak from attendance weeks.
4. Gems from `gem_events`.
5. Elder.
6. Diff old vs new level/tier → emit `level.up` / `tier.up` notifications (per sport for sport levels: "Level 12 in Running").

Runs in one transaction after each ledger write; nightly cron runs it for all users with any activity in the last 8 days plus everyone with a non-zero streak.

## 8. Anti-abuse

- Coach can only record attendance on events of their sport; QR tokens are time-boxed; every void and adjustment is audited.
- A user cannot attend two events whose time ranges overlap by more than 50% (server check on second insert → coach gets a warning and must confirm). Overlapping *registration* is fine.
- Admin dashboard shows "XP by actor" for the last 30 days to spot a coach over-ticking.

## 9. Tests that must exist (unit)

`xpForLevel`/`level` monotonic and matching the table above · tier boundaries · streak across year boundary (W52→W01) and DST changes · idempotent double award · void nets to zero · elder window edge (day 180 vs 181).
