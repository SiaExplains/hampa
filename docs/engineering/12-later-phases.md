---
title: Later Phases
type: reference
status: draft
updated: 2026-10-20
---

# Later phases — parked on purpose

Everything from `../features.md` and the Telegram-era wish list that is **not** Phase 1, with the phase it belongs to and the data already prepared for it. Do not build any of this in a Phase 1 session.

## Phase 1.5 — right after launch
| Item | Notes |
|---|---|
| Telegram mirror bot | `10-build-plan.md` last section. Needs `sports.telegram_topic_id`. |
| Google OAuth | Supabase dashboard toggle + a button; no schema change. |
| Streak insurance UI | `gem_events.streak_insurance` is reserved. Price: 3 GEMs per missed week, max 1 per 4 weeks. |
| Recurring events | `events.recurrence_rule` (RRULE) + generator in nightly cron. |
| Jalali calendar toggle | display-only. |

## Phase 2 — social layer
| Item | Notes |
|---|---|
| Event recap / photo album | per event, coach-uploaded, members-only; needs `event_media`, consent for photos of people (DSGVO/KUG — opt-out per user) |
| Sport reactions on events/recaps | custom set (💪 🔥 🤝); no generic like |
| Activity feed (follow-based) | attendance, level-ups, recaps; the `follows` table is ready |
| Event comments | threaded, coach-moderated, report flow |
| Health topic / discussion board | explicitly gated by `08-gdpr-and-security.md` — health data is special-category; design as general discussion, never store health attributes |
| Author role + articles | `global_role` stays; add `permissions` flags |
| Badges wall | activity (per sport milestones, 4 tiers), event (founding variants), social (Coach, Organizer, Founding Hampa) — computed from existing ledgers; `badges`, `user_badges` |
| Group leaderboards | opt-in, per sport, consistency-weighted (attendance count, not XP); weekly reset; `leaderboard_snapshots` |
| Coach co-assignment on events | `event_coaches` instead of single creator |

## Phase 3 — mobile & tracking
| Item | Notes |
|---|---|
| Native iOS/Android (Expo) | same tRPC API, bearer-token path, extract `@hampa/shared` |
| Push via APNs/FCM | replaces Web Push on native |
| Manual activity logging | sport tile quick-add; feeds badges, not XP (XP stays attendance-only) |
| Strava / Apple Health / Google Fit import | consent-heavy; badge verification only |
| Per-sport custom metrics (km, PRs) | `user_sport_stats` extension |
| Activity heatmap | from attendance + logs |
| 1v1 / group challenges | opt-in, group-scoped |
| Skill matching / "open to play" | profile toggle + availability |

## Phase 4 — scale
| Item | Notes |
|---|---|
| Multiple cities | `cities` exists; add city selector, per-city sports/coaches; expansion Berlin → DE → EU |
| Map-based event discovery | needs venue geocoding, not user GPS |
| Trending sports | analytics on joins/attendance |
| Verein integration | membership classes, Mitgliedsbeitrag (first financial activity → payments, SEPA, Steuerberater) |
| Rare/seasonal badge drops | |
| Advanced moderation (reports, bans with reasons, rule references) | partially covered by suspend + audit in Phase 1 |

## Explicitly rejected
- GPS check-in (privacy; QR is enough for a community that meets in person).
- Public (unauthenticated) profiles or events.
- Any XP for solo/self-reported activity.
- Ads, paid tiers, in-app purchases.
